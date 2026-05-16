import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from "../../components/layout/footer/footer";
import { NoticiaService } from '../../services/Noticia.Service';
import { NotificacionService } from '../../services/Notificacion.Service';
import { TokenService } from '../../services/Token.Service';
import { NoticiaResponse } from '../../interfaces/Noticia.Interface';
import { FormNoticia } from '../../components/forms/form-noticia/form-noticia';
import { RouterModule } from '@angular/router';
import { Confirmacion } from "../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../components/dialogs/mensaje/notificacion";

/**
 * Componente principal de la aplicación (Página de Inicio).
 * Presenta la propuesta de valor y las últimas novedades del centro.
 * Implementa una funcionalidad de "Edición Rápida" para usuarios con rol administrativo,
 * permitiendo gestionar el tablón de anuncios sin abandonar la vista principal.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Navbar, CommonModule, Footer, FormNoticia, RouterModule, Confirmacion, Notificacion],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {

  // --- Propiedades de Datos ---
  listaNoticias: NoticiaResponse[] = []; // Subconjunto de noticias destacadas

  // --- Gestión de UI y Modales ---
  noticiaSeleccionada: NoticiaResponse | null = null; // Buffer para edición (Deep Copy)
  mostrarModal: boolean = false; // Control de renderizado para el componente FormNoticia

  /**
   * @param noticiaService Acceso a la API de contenidos informativos.
   * @param tokenService Determina si el usuario tiene permisos para ver botones de edición.
   * @param cdr Sincronizador de la vista ante actualizaciones asíncronas de datos.
   */
  constructor(
    private noticiaService: NoticiaService,
    public tokenService: TokenService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Carga inicial de contenidos destacados.
   */
  ngOnInit(): void {
    this.cargarNoticias();
  }

  /**
   * Recupera las noticias y limita la visualización a las 6 más recientes 
   * para mantener una estética de landing page limpia.
   */
  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        this.listaNoticias = [...res.data.slice(0, 6)];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar noticias en el front:', err)
    });
  }

  // ===========================================================================
  // --- FLUJO DE GESTIÓN RÁPIDA (Solo Administradores) ---
  // ===========================================================================

  /**
   * Inicializa el flujo para añadir un nuevo anuncio al tablón.
   */
  abrirCrear(): void {
    this.noticiaSeleccionada = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Prepara la edición de una noticia mediante clonación profunda (JSON parse/stringify)
   * para evitar que cambios temporales en el formulario se reflejen en la UI antes de guardar.
   */
  abrirEditar(noticia: NoticiaResponse): void {
    this.noticiaSeleccionada = JSON.parse(JSON.stringify(noticia));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Canaliza la información hacia el servicio de noticias.
   * @param datos Objeto FormData que incluye el cuerpo de la noticia y el archivo binario.
   */
  onPublicarNoticia(datos: FormData): void {
    const esEdicion = !!this.noticiaSeleccionada;
    const accion = esEdicion
      ? this.noticiaService.actualizar(this.noticiaSeleccionada!.idNoticia, datos)
      : this.noticiaService.crear(datos);

    accion.subscribe({
      next: (res) => {
        // Usamos el patrón de notificación de tu proyecto
        this.notificacionService.mostrar({
          titulo: '¡Éxito!',
          mensaje: esEdicion ? 'Noticia actualizada correctamente' : 'Noticia publicada con éxito',
          tipo: 'exito'
        });

        this.cerrarModal();
        this.cargarNoticias();
      },
      error: (err) => {
        console.error("Error en la persistencia de noticia:", err);

        this.notificacionService.mostrar({
          titulo: 'Error',
          mensaje: err.error?.message || 'No se pudo procesar la noticia',
          tipo: 'error'
        });
      }
    });
  }

  /**
   * Resetea el estado del modal y limpia referencias.
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.noticiaSeleccionada = null;
    this.cdr.detectChanges();
  }
}