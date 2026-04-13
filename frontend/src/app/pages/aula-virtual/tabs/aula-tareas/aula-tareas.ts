import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { TokenService } from '../../../../services/Token.Service';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Componente del Aula Virtual dedicado a la gestión y listado de tareas.
 * Diferencia la lógica de visualización entre profesores (todas las tareas) 
 * y alumnos (solo tareas publicadas y estado de sus entregas).
 */
@Component({
  selector: 'app-aula-tareas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-tareas.html',
  styleUrl: './aula-tareas.scss',
})
export class AulaTareas implements OnInit {
  tareas: TareaResponse[] = []; // Listado de actividades académicas recuperadas
  cargando: boolean = true; // Flag de control para el estado de carga de la lista
  esProfesor: boolean = false; // Flag de permisos basado en el rol del usuario actual

  /**
   * @param tareaService Operaciones CRUD y de consulta para el módulo de tareas.
   * @param tokenService Extracción de identidad y rol desde el token de sesión.
   * @param route Acceso a parámetros de la ruta padre (ID del taller).
   * @param cdr Detección de cambios manual para asegurar la sincronía de la UI.
   * @param router Gestión de navegación hacia el detalle de la tarea.
   */
  constructor(
    private tareaService: TareaService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Inicializa el componente validando el rol del usuario y recuperando el ID del taller.
   */
  ngOnInit(): void {
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.listarTareas(Number(idTaller));
    }
  }

  /**
   * Recupera las tareas del taller aplicando filtros según el rol del usuario.
   * @param id Identificador único del taller.
   */
  listarTareas(id: number): void {
    this.cargando = true;
    const idAlumno = this.tokenService.getId();

    // Discriminación de fuente de datos según permisos
    const obs = this.esProfesor
      ? this.tareaService.listarPorTaller(id)
      : this.tareaService.listarVisibles(id, idAlumno!);

    obs.subscribe({
      next: (res) => {
        this.tareas = res.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tareas:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Navega a la vista de detalle o entrega de una tarea específica.
   * @param idTarea Identificador único de la tarea seleccionada.
   */
  verDetalle(idTarea: number): void {
    this.router.navigate(['../detalle', 'tarea', idTarea], {
      relativeTo: this.route
    });
  }
}