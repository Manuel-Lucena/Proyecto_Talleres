import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { MaterialService } from '../../../../services/Material.Service';
import { TokenService } from '../../../../services/Token.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

/**
 * Componente principal del tablón o "muro" del Aula Virtual.
 * Unifica cronológicamente las tareas y materiales didácticos, aplicando filtros
 * de visibilidad según el rol del usuario (Profesor/Alumno).
 */
@Component({
  selector: 'app-aula-muro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-muro.html',
  styleUrl: './aula-muro.scss',
})
export class AulaMuro implements OnInit {
  actividades: any[] = []; // Colección unificada de tareas y materiales ordenados por fecha
  cargando: boolean = true; // Estado de carga para la sincronización de flujos de datos
  esProfesor: boolean = false; // Flag de permisos basado en el rol extraído del JWT

  /**
   * @param tareaService Servicio para la recuperación de actividades evaluables.
   * @param materialService Servicio para la recuperación de recursos didácticos.
   * @param tokenService Gestión de sesión para validar identidad y privilegios.
   * @param route Acceso a los parámetros de la ruta padre (ID del taller).
   * @param cdr Detección de cambios manual para asegurar la consistencia de la UI.
   * @param router Gestión de navegación hacia el detalle de los recursos.
   */
  constructor(
    private tareaService: TareaService,
    private materialService: MaterialService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Inicializa el componente validando el rol del usuario e iniciando la carga paralela del muro.
   */
  ngOnInit(): void {
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.cargarMuro(Number(idTaller));
    }
  }

  /**
   * Coordina la carga de tareas y materiales mediante forkJoin para una experiencia síncrona.
   * Transforma y ordena los resultados cronológicamente para su visualización en el muro.
   * @param idTaller Identificador único del taller activo.
   */
  cargarMuro(idTaller: number): void {
    this.cargando = true;
    const idAlumno = this.tokenService.getId();
   
    // Definición de observables según el contexto de permisos
    const tareasObs = this.esProfesor
      ? this.tareaService.listarPorTaller(idTaller)
      : this.tareaService.listarVisibles(idTaller, idAlumno!);

    const materialesObs = this.esProfesor
      ? this.materialService.listarPorTaller(idTaller)
      : this.materialService.listarVisibles(idTaller);

    forkJoin({
      tareas: tareasObs,
      materiales: materialesObs
    }).subscribe({
      next: (res) => {
        // Mapeo y normalización de TAREAS
        const tareasMapped = res.tareas.data.map(t => ({
          ...t,
          tipo: 'TAREA',
          fechaMuro: new Date(t.fechaPublicacion || (t as any).createdAt || new Date())
        }));

        // Mapeo y normalización de MATERIALES
        const materialesMapped = res.materiales.data.map(m => ({
          ...m,
          tipo: 'MATERIAL',
          fechaMuro: new Date((m as any).fechaSubida || (m as any).createdAt || new Date())
        }));

        // Mezcla y ordenación descendente (más reciente primero)
        this.actividades = [...tareasMapped, ...materialesMapped].sort((a, b) =>
          b.fechaMuro.getTime() - a.fechaMuro.getTime()
        );

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el muro:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Redirige al usuario a la vista de detalle específica según el tipo de recurso seleccionado.
   * @param item Objeto normalizado del muro (Tarea o Material).
   */
  verDetalle(item: any): void {
    const idRecurso = item.tipo === 'TAREA' ? item.idTarea : item.id;
    const tipoUrl = item.tipo.toLowerCase();

    this.router.navigate(['../detalle', tipoUrl, idRecurso], {
      relativeTo: this.route
    });
  }
}