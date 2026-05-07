import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { FormCalificar } from '../../../../components/forms/form-calificar/form-calificar';

/**
 * COMPONENTE DE SEGUIMIENTO DOCENTE: Panel de Calificaciones.
 * * Este componente actúa como un concentrador de datos para el profesor.
 * 1. Sincronización Paralela: Cruza alumnos inscritos con entregas realizadas mediante forkJoin.
 * 2. Lógica de Negocio: Clasifica el estado de cada estudiante (Pendiente, Entregado, Calificado).
 * 3. Gestión de Feedback: Facilita la apertura del módulo de calificación individual.
 */
@Component({
  selector: 'app-aula-tarea-seguimiento',
  standalone: true,
  imports: [CommonModule, FormCalificar],
  templateUrl: './aula-tarea-seguimiento.html',
  styleUrl: './aula-tarea-seguimiento.scss'
})
export class AulaTareaSeguimiento implements OnInit {

  // --- Propiedades de Datos ---
  idTaller: number = 0;                       // Contexto del taller actual
  idTarea: number = 0;                        // ID de la actividad a supervisar
  tarea: any = null;                          // Datos descriptivos de la tarea
  filas: any[] = [];                          // LISTADO unificada: Alumno + Entrega + Estado

  // --- Propiedades de Estado y UI ---
  cargando: boolean = true;                   // Orquestador de visualización de carga
  mostrarModalCalificar: boolean = false;     // Control del diálogo de calificación
  entregaSeleccionada: any = null;            // Referencia activa para el formulario hijo

  /**
   * @param route Captura parámetros de la URL profunda.
   * @param router Gestiona el flujo de retorno al listado.
   * @param usuarioService Recupera el listado de alumnos del taller.
   * @param entregaService Obtiene los archivos y registros de entrega de la tarea.
   * @param tareaService Provee los datos base de la actividad.
   * @param cdr Sincroniza la tabla tras la resolución de peticiones concurrentes.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private entregaService: EntregaService,
    private tareaService: TareaService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Resuelve los identificadores de ruta e inicia la carga masiva de datos.
   */
  ngOnInit(): void {
    this.idTarea = Number(this.route.snapshot.paramMap.get('idRecurso'));
    this.idTaller = Number(this.route.snapshot.paramMap.get('id')) || 
                    Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.cargarDatos();
  }

  // ===========================================================================
  // --- PROCESAMIENTO DE DATOS ---
  // ===========================================================================

  /**
   * Ejecuta peticiones paralelas para construir la LISTADO de seguimiento.
   * * TÉCNICA: Se utiliza forkJoin para garantizar la atomicidad de los datos:
   * No se renderiza la tabla hasta que todas las fuentes han respondido.
   */
  cargarDatos(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    forkJoin({
      usuarios: this.usuarioService.listarPorTaller(this.idTaller),
      entregas: this.entregaService.listarPorTarea(this.idTarea),
      tarea: this.tareaService.obtenerPorId(this.idTarea)
    }).subscribe({
      next: (res: any) => {
        this.tarea = res.tarea?.data;
        const listaUsuarios = res.usuarios?.data || [];
        const listaEntregas = res.entregas?.data || [];

   
        this.filas = listaUsuarios
          .filter((u: any) => u.nombreRol?.toUpperCase() === 'ALUMNO')
          .map((alumno: any) => {
            const entrega = listaEntregas.find((e: any) => 
              String(e.idUsuario) === String(alumno.idUsuario)
            );
            return {
              alumno: alumno,
              entrega: entrega || null,
              estado: this.definirEstado(entrega)
            };
          });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error crítico en sincronización de seguimiento:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- HELPERS Y LÓGICA DE INTERFAZ ---
  // ===========================================================================

  /**
   * Determina la categoría visual según el flujo de la entrega.
   */
  private definirEstado(entrega: any): string {
    if (!entrega) return 'PENDIENTE';
    if (entrega.calificacion !== null && entrega.calificacion !== undefined) return 'CALIFICADO';
    return 'ENTREGADO';
  }

  /**
   * Provee una métrica rápida del progreso del grupo.
   */
  get totalEntregados(): number {
    return this.filas.filter((f: any) => f.entrega !== null).length;
  }

  /**
   * Dispara el flujo de calificación para una fila específica.
   */
  abrirCalificador(fila: any): void {
    if (fila.entrega) {
      this.entregaSeleccionada = fila.entrega;
      this.mostrarModalCalificar = true;
      this.cdr.detectChanges();
    }
  }

  /**
   * Retorno seguro al aula virtual.
   */
  volver(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas']);
  }
}