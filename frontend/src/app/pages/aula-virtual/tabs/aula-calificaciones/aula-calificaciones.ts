import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TareaService } from '../../../../services/Tarea.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TokenService } from '../../../../services/Token.Service';

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
  filas: any[] = [];         // Listado de datos procesados (Tarea + Entrega)

  // --- Estado de UI ---
  cargando: boolean = true;  // Flag para el skeleton/spinner

  /**
   * @param tareaService Gestión de tareas asignadas.
   * @param entregaService Obtención de calificaciones y feedback.
   * @param tokenService Identificación del alumno actual.
   */
  constructor(
    private tareaService: TareaService,
    private entregaService: EntregaService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Ciclo de vida: Captura el ID del taller desde la ruta padre
   * e inicia la carga de datos del alumno.
   */
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idTaller = Number(id);
        this.cargarDatos();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE CÁLCULO Y NEGOCIO ---
  // ===========================================================================

  /**
   * Calcula el promedio de las tareas calificadas.
   * Solo tiene en cuenta aquellas filas donde la nota no es null.
   * @returns Media aritmética con dos decimales.
   */
  get mediaTaller(): number {
    const notas = this.filas.filter(f => f.nota !== null).map(f => f.nota);
    if (notas.length === 0) return 0;
    const suma = notas.reduce((a, b) => a + b, 0);
    return parseFloat((suma / notas.length).toFixed(2));
  }

  /**
   * Proceso de carga en dos pasos:
   * 1. Lista las tareas que el alumno tiene permiso para ver.
   * 2. Por cada tarea, busca si existe una entrega del alumno para extraer la nota.
   */
  cargarDatos() {
    this.cargando = true;
    const idUsuario = this.tokenService.getId();

    this.tareaService.listarVisibles(this.idTaller).subscribe({
      next: (resTareas) => {
        const tareas = resTareas.data || [];
        this.filas = [];

        if (tareas.length === 0) {
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        // Mapeo cruzado de Tareas y Entregas
        tareas.forEach((tarea, index) => {
          this.entregaService.listarPorTarea(tarea.idTarea).subscribe({
            next: (resEntregas) => {
              const miEntrega = resEntregas.data.find((e: any) => e.idUsuario === idUsuario);
              this.filas.push({
                idTarea: tarea.idTarea,
                titulo: tarea.titulo,
                entregado: !!miEntrega,
                nota: miEntrega ? miEntrega.calificacion : null,
                comentario: miEntrega ? miEntrega.comentarioProfesor : ''
              });

              // Finaliza la carga cuando se procesa la última tarea
              if (index === tareas.length - 1) this.finalizarCarga();
            },
            error: () => {
              this.filas.push({
                idTarea: tarea.idTarea,
                titulo: tarea.titulo,
                entregado: false,
                nota: null,
                comentario: ''
              });
              if (index === tareas.length - 1) this.finalizarCarga();
            }
          });
        });
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Gestiona el cierre visual de la carga con un pequeño delay 
   * para evitar parpadeos en la UI.
   */
  finalizarCarga() {
    setTimeout(() => {
      this.cargando = false;
      this.cdr.detectChanges();
    }, 100);
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Navega a la vista detallada de la tarea.
   * @param idTarea Identificador de la tarea seleccionada.
   */
  verDetalle(idTarea: number) {
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', 'tarea', idTarea]);
  }
}