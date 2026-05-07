import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiaService } from '../../../../services/Noticia.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { NoticiaResponse } from '../../../../interfaces/Noticia.Interface';
import { FormNoticia } from '../../../../components/forms/form-noticia/form-noticia';
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { PaginatePipe } from '../../../../pipes/PaginatePipe';

/**
 * Componente administrativo para la gestión del tablón de anuncios y noticias.
 * Centraliza las funciones de redacción, publicación con imágenes, edición 
 * y moderación de contenidos informativos del sistema.
 */
@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, FormNoticia, Notificacion, Confirmacion, PaginatePipe],
  templateUrl: './admin-noticias.html',
  styleUrl: './admin-noticias.scss'
})
export class AdminNoticias implements OnInit {

  /** Utilidad para que el HTML pueda usar funciones matemáticas en la paginación */
  protected readonly Math = Math;

  // --- Propiedades de Datos ---
  noticias: NoticiaResponse[] = []; // Colección de noticias recuperadas del servidor

  // --- Control de Paginación ---
  /** Página actual del listado */
  paginaActual: number = 1;
  /** Cantidad de registros visibles por página */
  registrosPorPagina: number = 5;

  // --- Estado de la Interfaz ---
  /** Texto reactivo del input de búsqueda con reset de página */
  private _busqueda: string = '';
  get busqueda(): string { return this._busqueda; }
  set busqueda(value: string) {
    this._busqueda = value;
    this.paginaActual = 1; 
  }

  mostrarModal: boolean = false;    // Estado de visibilidad del componente modal de formulario
  noticiaSeleccionada: NoticiaResponse | null = null; // Buffer para distinguir entre Alta y Edición

  /**
   * @param noticiaService Interfaz de comunicación con el endpoint de noticias.
   * @param notificacionService Sistema global para alertas y confirmaciones de usuario.
   * @param cdr Servicio para forzar la actualización de la vista ante cambios asíncronos.
   */
  constructor(
    private noticiaService: NoticiaService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Carga el histórico de noticias al inicializar el componente.
   */
  ngOnInit(): void {
    this.cargarNoticias();
  }

  /**
   * Recupera el listado completo de noticias desde el backend.
   */
  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        this.noticias = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE FILTRADO ---
  // ===========================================================================

  /**
   * Getter que procesa la búsqueda en tiempo real sobre la colección local.
   * Filtra las noticias cuyo título contenga la cadena de búsqueda.
   */
  get noticiasFiltradas() {
    return this.noticias.filter(n => 
      n.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  // ===========================================================================
  // --- OPERACIONES DE GESTIÓN (CRUD) ---
  // ===========================================================================

  /**
   * Prepara el entorno para la creación de una nueva publicación.
   */
  abrirCrear() {
    this.noticiaSeleccionada = null; 
    this.mostrarModal = true;
  }

  /**
   * Carga una noticia existente para su edición utilizando una copia superficial.
   * @param n El objeto noticia seleccionado de la lista.
   */
  abrirEditar(n: NoticiaResponse) {
    this.noticiaSeleccionada = { ...n };
    this.mostrarModal = true;
  }

  /**
   * Orquestador para el guardado de datos. Determina si debe llamar a 'crear' o 'actualizar'.
   * @param fd FormData que encapsula el DTO de la noticia y el archivo binario de la imagen.
   */
  ejecutarGuardado(fd: FormData): void {
    if (this.noticiaSeleccionada) {
      this.noticiaService.actualizar(this.noticiaSeleccionada.idNoticia, fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Noticia actualizada correctamente', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        },
        error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar la noticia', tipo: 'error' })
      });
    } else {
      this.noticiaService.crear(fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Publicado', mensaje: 'La noticia se ha lanzado con éxito', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        }
      });
    }
  }

  /**
   * Ejecuta el borrado definitivo de una noticia previa confirmación por parte del administrador.
   * @param id Identificador único de la publicación a eliminar.
   */
  eliminarNoticia(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar noticia?',
      mensaje: 'Esta acción es irreversible y la publicación desaparecerá del tablón.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.noticiaService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Borrada', mensaje: 'Publicación eliminada del sistema', tipo: 'exito' });
            this.cargarNoticias();
          }
        });
      }
    });
  }
}