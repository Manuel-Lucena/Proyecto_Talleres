import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';

import { TallerService } from '../../services/Taller.Service'; 
import { BreadcrumbService } from '../../services/Breadcrumb.Service'; 

@Component({
  selector: 'app-aula-virtual',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './aula-virtual.html',
  styleUrl: './aula-virtual.scss'
})
export class AulaVirtual implements OnInit {
  idTaller!: number;
  nombreTaller: string = 'Cargando taller...';
  
  seccionActual: string = ''; 
  recursoNombre: string = ''; 
  seccionEnlace: string = ''; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tallerService: TallerService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Obtener ID del Taller
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idTaller = Number(id);
        this.cargarNombreTaller();
      }
    });

    // 2. Detectar cambios de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarBreadcrumbDesdeRuta();
    });

    // 3. Escuchar el nombre dinámico (Tarea/Material)
    this.breadcrumbService.recursoNombre$.subscribe(nombre => {
      this.recursoNombre = nombre;
      // Si estamos en un detalle, nos aseguramos de que la sección sea correcta
      if (nombre && !this.seccionActual) {
          this.actualizarBreadcrumbDesdeRuta();
      }
      this.cdr.detectChanges();
    });

    // Ejecución inicial
    this.actualizarBreadcrumbDesdeRuta();
  }

  cargarNombreTaller() {
    this.tallerService.obtenerPorId(this.idTaller).subscribe({
      next: (res) => {
        this.nombreTaller = res.data.nombre;
        this.cdr.detectChanges();
      }
    });
  }

  actualizarBreadcrumbDesdeRuta() {
    // IMPORTANTE: Empezamos desde la raíz de la ruta activa
    let currentRoute: ActivatedRoute | null = this.route;

    // Recorremos todos los hijos hasta llegar al último activo
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    // Leemos el breadcrumb del DATA del último hijo
    const breadcrumb = currentRoute?.snapshot.data['breadcrumb'];
    const params = currentRoute?.snapshot.params;

    if (breadcrumb !== undefined) {
      this.seccionActual = breadcrumb;
      
      // Lógica para el enlace de retorno
      // Si la URL tiene 'detalle' y el tipo es 'material', el enlace vuelve a recursos
      if (this.router.url.includes('/detalle/material')) {
          this.seccionActual = 'Materiales'; // Forzamos nombre si es detalle
          this.seccionEnlace = 'recursos';
      } else if (this.router.url.includes('/detalle/tarea')) {
          this.seccionActual = 'Tareas'; // Forzamos nombre si es detalle
          this.seccionEnlace = 'tareas';
      } else {
          // Si es una pestaña normal (muro, foro, etc)
          this.seccionEnlace = this.router.url.split('/').pop() || '';
      }

      // Limpieza: si no hay "idRecurso" en la URL, borramos el nombre del recurso
      if (!this.router.url.includes('/detalle/') && !this.router.url.includes('/seguimiento')) {
        this.recursoNombre = '';
        this.breadcrumbService.setRecursoNombre('');
      }
    }
    this.cdr.detectChanges();
  }

  irACrear(tipo: 'tarea' | 'material'): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', tipo, 'nuevo']);
  }
}