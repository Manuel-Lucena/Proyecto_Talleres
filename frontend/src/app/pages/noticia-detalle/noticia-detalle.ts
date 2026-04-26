import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoticiaService } from '../../services/Noticia.Service';
import { NoticiaResponse } from '../../interfaces/Noticia.Interface';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';

/**
 * Vista detallada de una noticia específica.
 * Se encarga de recuperar la información completa de una publicación mediante el ID 
 * obtenido de la URL, permitiendo una lectura cómoda y extendida del contenido.
 */
@Component({
  selector: 'app-noticia-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './noticia-detalle.html',
  styleUrl: './noticia-detalle.scss'
})
export class NoticiaDetalle implements OnInit {

  // --- Propiedades de Datos ---
  noticia?: NoticiaResponse; // Almacena el objeto noticia recuperado

  // --- Estado de la Interfaz ---
  cargando: boolean = true;  // Controla la visualización del spinner de carga

  /**
   * @param route Servicio para acceder a los parámetros de la ruta activa (ID).
   * @param noticiaService Comunicación con la API para obtener el detalle de la noticia.
   * @param cdr Sincronizador de la vista para asegurar el renderizado tras procesos asíncronos.
   */
  constructor(
    private route: ActivatedRoute,
    private noticiaService: NoticiaService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Captura el parámetro 'id' de la URL y dispara la carga de datos.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.obtenerDetalle(id);
  }

  // ===========================================================================
  // --- RECUPERACIÓN DE DATOS ---
  // ===========================================================================

  /**
   * Solicita al servicio los datos de la noticia por su identificador único.
   * Gestiona el estado de carga y fuerza la detección de cambios al finalizar.
   * @param id Identificador de la noticia (procedente de la ruta).
   */
  private obtenerDetalle(id: number): void { 
    this.noticiaService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.noticia = res.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al recuperar el detalle de la noticia:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}