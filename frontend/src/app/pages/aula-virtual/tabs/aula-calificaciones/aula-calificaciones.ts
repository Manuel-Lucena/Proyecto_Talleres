import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TareaService } from '../../../../services/Tarea.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TokenService } from '../../../../services/Token.Service';
import { InscripcionService } from '../../../../services/Inscripcion.Service';

/**
 * Componente de Calificaciones del Aula Virtual.
 * Se encarga de cruzar la información de las tareas visibles para el alumno
 * con sus entregas correspondientes para mostrar notas y feedback.
 */
@Component({
  selector: 'app-aula-calificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aula-calificaciones.html',
  styleUrl: './aula-calificaciones.scss'
})
export class AulaCalificaciones implements OnInit {
  // --- Estado de Datos ---
  idTaller!: number;
  filas: any[] = [];         // Listado para el alumno (Tarea + Entrega)
  listaAlumnos: any[] = [];  // Listado para el profesor (Resumen de la clase)
  totalTareasTaller: number = 0;

  // --- Estado de UI ---
  cargando: boolean = true;
  esProfesor: boolean = false;

  /**
   * @param tareaService Gestión de tareas asignadas.
   * @param entregaService Obtención de calificaciones y feedback.
   * @param tokenService Identificación del usuario y su rol.
   * @param inscripcionService Obtención de medias globales (Vista profesor).
   */
  constructor(
    private tareaService: TareaService,
    private entregaService: EntregaService,
    private inscripcionService: InscripcionService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    const rol = this.tokenService.getRol();
    this.esProfesor = rol === 'PROFESOR' || rol === 'ADMIN';
  }

  /**
   * Ciclo de vida: Captura el ID del taller desde la ruta padre
   * e inicia la carga de datos según el perfil del usuario.
   */
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idTaller = Number(id);
        this.cargarSegunRol();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE CARGA SEGÚN ROL ---
  // ===========================================================================

  /**
   * Deriva la carga de datos hacia la vista de alumno o la de profesor.
   */
  cargarSegunRol() {
    this.cargando = true;
    if (this.esProfesor) {
      this.cargarDatosGestionProfesor();
    } else {
      this.cargarDatosAlumno();
    }
  }

  /**
   * Lógica para el Profesor: Obtiene cuántas tareas hay en total y
   * la lista de promedios de todos los alumnos inscritos.
   */
  cargarDatosGestionProfesor() {
    this.inscripcionService.obtenerNotasGlobales(this.idTaller).subscribe({
      next: (res) => {
        this.listaAlumnos = res.data || [];
        this.finalizarCarga();
      },
      error: () => this.finalizarCarga()
    });
  }

  /**
   * Lógica para el Alumno: Lista tareas visibles y busca sus entregas.
   */
  cargarDatosAlumno() {
    this.tareaService.listarVisibles(this.idTaller).subscribe({
      next: (resTareas) => {
        const tareas = resTareas.data || [];
        this.filas = [];

        if (tareas.length === 0) {
          this.finalizarCarga();
          return;
        }

        const peticiones = tareas.map(tarea => {
          return new Promise<void>((resolve) => {
            this.entregaService.obtenerMiEntrega(tarea.idTarea).subscribe({
              next: (resEntrega) => {
                const miEntrega = resEntrega.data;
                this.filas.push({
                  idTarea: tarea.idTarea,
                  titulo: tarea.titulo,
                  entregado: !!miEntrega,
                  nota: miEntrega ? miEntrega.calificacion : null,
                  comentario: miEntrega ? miEntrega.comentarioProfesor : ''
                });
                resolve();
              },
              error: () => {
                this.filas.push({ idTarea: tarea.idTarea, titulo: tarea.titulo, entregado: false, nota: null, comentario: '' });
                resolve();
              }
            });
          });
        });

        Promise.all(peticiones).then(() => this.finalizarCarga());
      },
      error: () => this.finalizarCarga()
    });
  }

  // ===========================================================================
  // --- LÓGICA DE CÁLCULO Y NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Calcula el promedio de las tareas calificadas para el alumno actual.
   * @returns Media aritmética con dos decimales.
   */
  get mediaTaller(): number {
    const notas = this.filas.filter(f => f.nota !== null).map(f => f.nota);
    if (notas.length === 0) return 0;
    const suma = notas.reduce((a, b) => a + b, 0);
    return parseFloat((suma / notas.length).toFixed(2));
  }

  /**
   * Gestiona el cierre visual de la carga con un pequeño delay.
   */
  finalizarCarga() {
    setTimeout(() => {
      this.cargando = false;
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Navega a la vista detallada de la tarea.
   * @param idTarea Identificador de la tarea seleccionada.
   */
  verDetalle(idTarea: number) {
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', 'tarea', idTarea]);
  }

  /**
 * Navega a la vista de entregas filtrando por un alumno específico.
 * @param idAlumno ID del estudiante para ver su expediente.
 */
  verExpedienteAlumno(idAlumno: number) {
    this.router.navigate(['/aula-virtual', this.idTaller, 'seguimiento-alumno', idAlumno]);
  }
}