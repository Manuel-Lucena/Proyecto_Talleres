import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiaService } from '../../../../services/Noticia.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { NoticiaResponse } from '../../../../interfaces/Noticia.Interface';
import { FormNoticia } from '../../../../components/forms/form-noticia/form-noticia';
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";

/**
 * Componente administrativo para la gestión del tablón de noticias.
 * Permite la publicación, edición y eliminación de comunicados del centro.
 */
@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, FormNoticia, Notificacion, Confirmacion],
  templateUrl: './admin-noticias.html',
  styleUrl: './admin-noticias.scss'
})
export class AdminNoticias implements OnInit {
  noticias: NoticiaResponse[] = []; // Listado completo de noticias registradas
  busqueda: string = ''; // Término para el filtrado por título
  mostrarModal: boolean = false; // Control de visibilidad del formulario de noticias
  noticiaSeleccionada: NoticiaResponse | null = null; // Noticia activa para edición

  /**
   * @param noticiaService Operaciones CRUD para el módulo de noticias.
   * @param notificacionService Gestión de feedback visual y diálogos de confirmación.
   * @param cdr Detección de cambios manual para actualizaciones asíncronas.
   */
  constructor(
    private noticiaService: NoticiaService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente cargando el histórico de noticias.
   */
  ngOnInit(): void {
    this.cargarNoticias();
  }

  /**
   * Recupera la lista actualizada de noticias desde el servidor.
   */
  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        this.noticias = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Getter que devuelve la colección de noticias filtradas por el término de búsqueda.
   */
  get noticiasFiltradas() {
    return this.noticias.filter(n => 
      n.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  /**
   * Prepara el estado para redactar una nueva noticia.
   */
  abrirCrear() {
    this.noticiaSeleccionada = null;
    this.mostrarModal = true;
  }

  /**
   * Carga una noticia existente en el modal para su modificación.
   * @param n Objeto noticia seleccionado.
   */
  abrirEditar(n: NoticiaResponse) {
    this.noticiaSeleccionada = { ...n };
    this.mostrarModal = true;
  }

  /**
   * Ejecuta la persistencia de datos (creación o actualización) mediante FormData.
   * @param fd Datos multiparte que incluyen el JSON de la noticia y la imagen.
   */
  ejecutarGuardado(fd: FormData): void {
    if (this.noticiaSeleccionada) {
      this.noticiaService.actualizar(this.noticiaSeleccionada.idNoticia, fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Noticia actualizada', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        },
        error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar', tipo: 'error' })
      });
    } else {
      this.noticiaService.crear(fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Publicado', mensaje: 'Noticia lanzada con éxito', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        }
      });
    }
  }

  /**
   * Solicita confirmación y elimina una publicación de forma definitiva.
   * @param id Identificador único de la noticia.
   */
  eliminarNoticia(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar noticia?',
      mensaje: 'Esta acción borrará la publicación para siempre.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.noticiaService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Borrada', mensaje: 'Noticia eliminada', tipo: 'exito' });
            this.cargarNoticias();
          }
        });
      }
    });
  }
}