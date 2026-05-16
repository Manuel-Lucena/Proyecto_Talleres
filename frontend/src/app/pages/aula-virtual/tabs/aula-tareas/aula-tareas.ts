import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { TokenService } from '../../../../services/Token.Service';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * COMPONENTE DE GESTIÓN ACADÉMICA: Listado de Actividades.
 * * Este componente implementa un patrón de "Vista Dual" basado en Roles:
 * 1. Profesores/Admin: Acceso total para supervisar tareas y entregas globales.
 * 2. Alumnos: Seguimiento de progreso personal y visualización de tareas publicadas.
 */
@Component({
  selector: 'app-aula-tareas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-tareas.html',
  styleUrl: './aula-tareas.scss',
})
export class AulaTareas implements OnInit {

  // --- Propiedades de Datos ---
  tareas: TareaResponse[] = [];               // Colección de actividades con metadatos de entrega

  // --- Propiedades de Estado y UI ---
  cargando: boolean = true;                   // Control de visibilidad para Skeleton/Loader
  esProfesor: boolean = false;                // Flag de autorización para herramientas de gestión

  /**
   * @param tareaService Lógica de persistencia y consulta para la entidad Tarea.
   * @param tokenService Proveedor de identidad y extracción de claims (ID, Rol).
   * @param route Acceso a la jerarquía de rutas para recuperar el ID del taller padre.
   * @param cdr Trigger manual para asegurar la sincronía de la UI tras procesos asíncronos.
   * @param router Motor de navegación para profundizar en el detalle del recurso.
   */
  constructor(
    private tareaService: TareaService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Ciclo de vida: Inicializa los permisos y resuelve el contexto del taller 
   * accediendo a la ruta padre para obtener el identificador único.
   */
  ngOnInit(): void {
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');
    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    
    if (idTaller) {
      this.listarTareas(Number(idTaller));
    }
  }

  // ===========================================================================
  // --- FLUJO DE DATOS Y AUTORIZACIÓN ---
  // ===========================================================================

  /**
   * Orquestador de carga de actividades con bifurcación lógica según perfil.
   * @param id Identificador único del Taller.
   */
  listarTareas(id: number): void {
    this.cargando = true;

    const obs = this.esProfesor 
      ? this.tareaService.listarPorTaller(id) 
      : this.tareaService.listarVisibles(id);

    obs.subscribe({
      next: (res) => {
        this.tareas = res.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error crítico al recuperar tareas:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Transición hacia la vista de detalle mediante navegación relativa.
   * @param idTarea Clave primaria para la carga del detalle.
   */
  verDetalle(idTarea: number): void {
    this.router.navigate(['../detalle', 'tarea', idTarea], { relativeTo: this.route });
  }
}