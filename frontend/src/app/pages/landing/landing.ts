import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from "../../components/layout/footer/footer";
import { NoticiaService } from '../../services/Noticia.Service';
import { TokenService } from '../../services/Token.Service';
import { NoticiaResponse } from '../../interfaces/Noticia.Interface';
import { FormNoticia } from '../../components/forms/form-noticia/form-noticia';

/**
 * Componente de la página de inicio (Landing Page).
 * Gestiona la visualización de las últimas noticias y permite a los administradores
 * realizar acciones rápidas de creación y edición de contenido informativo.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Navbar, CommonModule, Footer, FormNoticia],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  listaNoticias: NoticiaResponse[] = []; // Listado de noticias destacadas para la vista
  noticiaSeleccionada: NoticiaResponse | null = null; // Clon de la noticia activa para edición
  mostrarModal: boolean = false; // Control de visibilidad del modal de gestión

  /**
   * @param noticiaService Operaciones de consulta y persistencia de noticias.
   * @param tokenService Gestión de identidad y permisos de usuario.
   * @param cdr Detección de cambios manual para asegurar la sincronía de la UI.
   */
  constructor(
    private noticiaService: NoticiaService,
    public tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente recuperando las noticias más recientes.
   */
  ngOnInit(): void {
    this.cargarNoticias();
  }

  /**
   * Obtiene las últimas noticias (máximo 6) y actualiza la referencia de la lista.
   */
  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        // Aseguramos la inmutabilidad para activar la detección de cambios
        this.listaNoticias = [...res.data.slice(0, 6)];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar noticias:', err)
    });
  }

  /**
   * Configura el entorno para la creación de una nueva noticia.
   */
  abrirCrear(): void {
    this.noticiaSeleccionada = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Clona una noticia existente para su edición sin afectar al listado principal.
   * @param noticia Objeto noticia seleccionado desde la interfaz.
   */
  abrirEditar(noticia: NoticiaResponse): void {
    this.noticiaSeleccionada = JSON.parse(JSON.stringify(noticia));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Procesa el guardado (creación o actualización) de una noticia y refresca la vista.
   * @param datos Objeto FormData con los campos de la noticia e imagen adjunta.
   */
  onPublicarNoticia(datos: FormData): void {
    const accion = this.noticiaSeleccionada
      ? this.noticiaService.actualizar(this.noticiaSeleccionada.idNoticia, datos)
      : this.noticiaService.crear(datos);

    accion.subscribe({
      next: () => {
        this.cerrarModal();
        // Delay técnico para permitir la sincronización de archivos en el servidor
        setTimeout(() => {
          this.cargarNoticias();
        }, 800);
      },
      error: (err) => console.error("Error al guardar noticia:", err)
    });
  }

  /**
   * Cierra el modal de gestión y limpia la selección actual.
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.noticiaSeleccionada = null;
    this.cdr.detectChanges();
  }
}