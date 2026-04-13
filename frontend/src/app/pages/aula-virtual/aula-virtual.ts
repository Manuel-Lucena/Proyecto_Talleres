import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';

import { TallerService } from '../../services/Taller.Service'; 
import { BreadcrumbService } from '../../services/Breadcrumb.Service'; 

/**
 * Componente principal del Aula Virtual.
 * Actúa como contenedor (Layout) para las secciones de muro, tareas, recursos y foro,
 * gestionando dinámicamente el título del taller y el sistema de navegación (Breadcrumbs).
 */
@Component({
  selector: 'app-aula-virtual',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './aula-virtual.html',
  styleUrl: './aula-virtual.scss'
})
export class AulaVirtual implements OnInit {
  idTaller!: number; // Identificador único del taller activo
  nombreTaller: string = 'Cargando taller...'; // Nombre del taller para el encabezado
  
  seccionActual: string = ''; // Nombre de la sección activa (Muro, Tareas, etc.)
  recursoNombre: string = ''; // Nombre específico de la tarea o material en vista de detalle
  seccionEnlace: string = ''; // Ruta de retorno para la navegación jerárquica

  /**
   * @param route Acceso a los parámetros de la ruta (ID del taller).
   * @param router Gestión de eventos de navegación y redirecciones.
   * @param tallerService Recuperación de metadatos del taller.
   * @param breadcrumbService Comunicación de nombres de recursos entre componentes hijos.
   * @param cdr Detección de cambios manual para actualizaciones asíncronas de la UI.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tallerService: TallerService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa la escucha de parámetros, eventos de router y el servicio de breadcrumbs.
   */
  ngOnInit(): void {
    // 1. Obtención del ID del Taller desde la URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idTaller = Number(id);
        this.cargarNombreTaller();
      }
    });

    // 2. Suscripción a cambios de navegación para actualizar el hilo de Ariadna
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarBreadcrumbDesdeRuta();
    });

    // 3. Escucha de nombres dinámicos (Tareas/Materiales) emitidos por hijos
    this.breadcrumbService.recursoNombre$.subscribe(nombre => {
      this.recursoNombre = nombre;
      if (nombre && !this.seccionActual) {
          this.actualizarBreadcrumbDesdeRuta();
      }
      this.cdr.detectChanges();
    });

    this.actualizarBreadcrumbDesdeRuta();
  }

  /**
   * Recupera el nombre oficial del taller para mostrarlo en el banner superior.
   */
  cargarNombreTaller() {
    this.tallerService.obtenerPorId(this.idTaller).subscribe({
      next: (res) => {
        this.nombreTaller = res.data.nombre;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Analiza la ruta activa y sus metadatos (Data) para reconstruir la navegación jerárquica.
   */
  actualizarBreadcrumbDesdeRuta() {
    let currentRoute: ActivatedRoute | null = this.route;

    // Localización del último hijo activo en la jerarquía de rutas
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const breadcrumb = currentRoute?.snapshot.data['breadcrumb'];

    if (breadcrumb !== undefined) {
      this.seccionActual = breadcrumb;
      
      // Lógica de mapeo de enlaces de retorno según el contexto de detalle
      if (this.router.url.includes('/detalle/material')) {
          this.seccionActual = 'Materiales';
          this.seccionEnlace = 'recursos';
      } else if (this.router.url.includes('/detalle/tarea')) {
          this.seccionActual = 'Tareas';
          this.seccionEnlace = 'tareas';
      } else {
          this.seccionEnlace = this.router.url.split('/').pop() || '';
      }

      // Limpieza del estado si se navega fuera de una vista de detalle
      if (!this.router.url.includes('/detalle/') && !this.router.url.includes('/seguimiento')) {
        this.recursoNombre = '';
        this.breadcrumbService.setRecursoNombre('');
      }
    }
    this.cdr.detectChanges();
  }

  /**
   * Navega hacia el formulario de creación de nuevos recursos educativos.
   * @param tipo Discriminador entre 'tarea' o 'material'.
   */
  irACrear(tipo: 'tarea' | 'material'): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', tipo, 'nuevo']);
  }
}