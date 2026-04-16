import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';
import { TallerService } from '../../services/Taller.Service';
import { BreadcrumbService } from '../../services/Breadcrumb.Service';

/**
 * Shell Component (Contenedor) del Aula Virtual.
 * Se encarga de la orquestación visual y de navegación del entorno de aprendizaje.
 * Gestiona el banner dinámico, los hilos de Ariadna (breadcrumbs) y la 
 * comunicación entre el layout principal y las sub-rutas (muro, tareas, recursos).
 */
@Component({
  selector: 'app-aula-virtual',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './aula-virtual.html',
  styleUrl: './aula-virtual.scss'
})
export class AulaVirtual implements OnInit {

  // --- Identidad del Taller ---
  idTaller!: number; 
  nombreTaller: string = 'Cargando taller...';

  // --- Estado de Navegación (Breadcrumbs) ---
  seccionActual: string = '';  // Ej: "Tareas", "Materiales"
  recursoNombre: string = '';  // Ej: "Tarea 1: Introducción", "PDF Tema 2"
  seccionEnlace: string = '';  // Ruta base para volver atrás (Ej: 'tareas')

  /**
   * @param route Captura parámetros de la URL padre.
   * @param router Escucha eventos globales de navegación.
   * @param tallerService Obtiene metadatos para el encabezado.
   * @param breadcrumbService Puente para que los componentes hijos envíen el nombre del recurso actual.
   * @param cdr Sincroniza la UI tras cambios en el flujo de navegación o avisos del service.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tallerService: TallerService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Configura las suscripciones reactivas para mantener la UI sincronizada con la URL.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idTaller = Number(id);
        this.cargarNombreTaller();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarBreadcrumbDesdeRuta();
    });

   
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
   * Carga el nombre del taller para el banner superior.
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
   * Lógica de resolución de Breadcrumbs. 
   * Inspecciona los metadatos 'data' definidos en el AppRoutingModule para saber dónde está el usuario.
   */
  actualizarBreadcrumbDesdeRuta() {
    let currentRoute: ActivatedRoute | null = this.route;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const breadcrumb = currentRoute?.snapshot.data['breadcrumb'];
    
    if (breadcrumb !== undefined) {
      this.seccionActual = breadcrumb;

      // --- Mapeo de Enlaces de Retorno ---
      // Si estamos en un detalle, configuramos el enlace de vuelta a la lista correspondiente
      if (this.router.url.includes('/detalle/material')) {
        this.seccionActual = 'Materiales';
        this.seccionEnlace = 'recursos';
      } else if (this.router.url.includes('/detalle/tarea')) {
        this.seccionActual = 'Tareas';
        this.seccionEnlace = 'tareas';
      } else {
        this.seccionEnlace = this.router.url.split('/').pop() || '';
      }

      // Limpieza preventiva: Si volvemos a la raíz del aula, borramos nombres de recursos específicos
      if (!this.router.url.includes('/detalle/') && !this.router.url.includes('/seguimiento')) {
        this.recursoNombre = '';
        this.breadcrumbService.setRecursoNombre('');
      }
    }
    this.cdr.detectChanges();
  }

  /**
   * Redirige a los formularios de creación dentro del taller actual.
   */
  irACrear(tipo: 'tarea' | 'material'): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', tipo, 'nuevo']);
  }
}