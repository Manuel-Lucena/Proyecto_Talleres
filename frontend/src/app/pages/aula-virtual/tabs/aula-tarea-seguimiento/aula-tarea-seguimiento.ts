import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { UsuarioService } from '../../../../services/Usuario.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { FormCalificar } from '../../../../components/forms/form-calificar/form-calificar';

/**
 * Componente para el seguimiento y calificación de tareas por parte del profesor.
 * Cruza los datos de alumnos inscritos con sus respectivas entregas para generar
 * una matriz de estado y permitir la calificación individual.
 */
@Component({
  selector: 'app-aula-tarea-seguimiento',
  standalone: true,
  imports: [CommonModule, FormCalificar],
  templateUrl: './aula-tarea-seguimiento.html',
  styleUrl: './aula-tarea-seguimiento.scss'
})
export class AulaTareaSeguimiento implements OnInit {
  idTaller: number = 0; // Identificador del taller obtenido del contexto de ruta
  idTarea: number = 0; // Identificador de la tarea específica a supervisar
  tarea: any = null; // Metadatos de la tarea (título, descripción, etc.)
  cargando = true; // Estado de carga para la sincronización de múltiples peticiones
  filas: any[] = []; // Colección de objetos que vinculan Alumno + Entrega + Estado

  mostrarModalCalificar = false; // Control de visibilidad del formulario de calificación
  entregaSeleccionada: any = null; // Referencia de la entrega activa para calificar

  /**
   * @param route Acceso a parámetros de ruta (idTaller, idRecurso).
   * @param router Gestión de navegación de retorno.
   * @param usuarioService Recuperación de alumnos inscritos en el taller.
   * @param entregaService Obtención de archivos y estados de entrega.
   * @param tareaService Consulta de información base de la tarea.
   * @param cdr Detección manual de cambios para actualizaciones concurrentes.
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
   * Inicializa el componente capturando los IDs necesarios y disparando la carga de datos.
   */
  ngOnInit(): void {
    this.idTarea = Number(this.route.snapshot.paramMap.get('idRecurso'));
    this.idTaller = Number(this.route.snapshot.paramMap.get('id')) ||
      Number(this.route.parent?.snapshot.paramMap.get('id'));

    this.cargarDatos();
  }

  /**
   * Ejecuta peticiones paralelas para sincronizar alumnos y entregas.
   * Mapea los resultados en una estructura unificada para la tabla de seguimiento.
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

        // Cruce de datos: Mapeo de alumnos con su entrega (si existe)
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
        console.error("Error cargando seguimiento:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Navega de regreso al listado de tareas del aula virtual.
   */
  volver(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas']);
  }

  /**
   * Calcula el total de alumnos que han realizado el envío.
   */
  get totalEntregados(): number {
    return this.filas.filter((f: any) => f.entrega !== null).length;
  }

  /**
   * Determina el estado visual del alumno respecto a la tarea.
   * @param entrega Objeto de entrega del alumno.
   * @returns 'PENDIENTE', 'CALIFICADO' o 'ENTREGADO'.
   */
  private definirEstado(entrega: any): string {
    if (!entrega) return 'PENDIENTE';
    if (entrega.calificacion !== null && entrega.calificacion !== undefined) return 'CALIFICADO';
    return 'ENTREGADO';
  }

  /**
   * Abre el modal de calificación para una fila específica si existe una entrega.
   * @param fila Objeto de la fila seleccionada.
   */
  abrirCalificador(fila: any): void {
    if (fila.entrega) {
      this.entregaSeleccionada = fila.entrega;
      this.mostrarModalCalificar = true;
      this.cdr.detectChanges();
    }
  }
}