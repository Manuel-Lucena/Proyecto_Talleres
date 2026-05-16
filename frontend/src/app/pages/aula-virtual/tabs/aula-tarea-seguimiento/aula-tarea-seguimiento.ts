import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Servicios
import { UsuarioService } from '../../../../services/Usuario.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { TareaAsignadaService } from '../../../../services/TareaAsignada.Service';

// Componentes y tipos
import { FormCalificar } from '../../../../components/forms/form-calificar/form-calificar';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
import { EntregaResponse } from '../../../../interfaces/Entrega.Interface';
import { TareaAsignadaResponse } from '../../../../interfaces/TareaAsignada.Interface';

/**
 * COMPONENTE DE SEGUIMIENTO DOCENTE: Panel de Calificaciones.
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
  idTaller: number = 0;
  idTarea: number | null = null;            // ID de la tarea seleccionada (Modo Tarea)
  idAlumno: number | null = null;           // ID del alumno seleccionado (Modo Alumno)

  tarea: TareaResponse | null = null;       // Metadatos de la tarea actual
  alumnoExpediente: UsuarioResponse | null = null; // Datos del perfil del alumno
  filas: any[] = [];                        // Datos unificados para la tabla (Alumno o Tarea)

  // --- Propiedades de Estado y UI ---
  modoAlumno: boolean = false;              // true: Expediente Alumno | false: Seguimiento Tarea
  cargando: boolean = true;                 // Estado de carga de las peticiones
  mostrarModalCalificar: boolean = false;    // Control de visibilidad del modal
  entregaSeleccionada: EntregaResponse | null = null; // Entrega para calificar

  /**
   * @param route Acceso a parámetros de ruta y data (mode).
   * @param router Navegación entre vistas.
   * @param usuarioService Gestión de datos de perfiles.
   * @param entregaService Gestión de calificaciones y archivos entregados.
   * @param tareaService Obtención de metadatos de actividades.
   * @param tareaAsignadaService Gestión de visibilidad selectiva.
   * @param cdr Detección manual de cambios para evitar errores de ciclo de vida.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private entregaService: EntregaService,
    private tareaService: TareaService,
    private tareaAsignadaService: TareaAsignadaService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente determinando el modo de visualización 
   * (Alumno o Tarea) según la metadata de la ruta.
   */
  ngOnInit(): void {
    const idRecurso = Number(this.route.snapshot.paramMap.get('idRecurso'));
    const mode = this.route.snapshot.data['mode'];

    this.idTaller = Number(this.route.snapshot.paramMap.get('id')) ||
      Number(this.route.parent?.snapshot.paramMap.get('id'));

    if (mode === 'ALUMNO') {
      this.modoAlumno = true;
      this.idAlumno = idRecurso;
      this.idTarea = null;
    } else {
      this.modoAlumno = false;
      this.idTarea = idRecurso;
      this.idAlumno = null;
    }

    this.cargarDatos();
  }

  /**
   * Orquestador de carga principal.
   * Activa el estado de carga y deriva la lógica según el modo seleccionado.
   */
  cargarDatos(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    if (this.modoAlumno && this.idAlumno) {
      this.cargarModoAlumno(this.idAlumno);
    } else if (this.idTarea) {
      this.cargarModoTarea(this.idTarea);
    }
  }

  /**
   * Obtiene tareas del taller, asignaciones del alumno y sus entregas.
   * Sincroniza la visibilidad para que coincida con lo que el alumno ve en su panel.
   * @param idAlumno ID del alumno a consultar.
   */
  private cargarModoAlumno(idAlumno: number): void {
    forkJoin({
      tareasTotales: this.tareaService.listarPorTaller(this.idTaller),
      misAsignaciones: this.tareaAsignadaService.listarPorAlumno(idAlumno).pipe(
        catchError(() => of({ data: [] }))
      ),
      entregas: this.entregaService.listarPorAlumnoYTaller(idAlumno, this.idTaller),
      usuario: this.usuarioService.obtenerPorId(idAlumno)
    }).subscribe({
      next: (res: any) => {
        this.alumnoExpediente = res.usuario?.data;
        const tareas: TareaResponse[] = res.tareasTotales?.data || [];
        const misAsig: TareaAsignadaResponse[] = res.misAsignaciones?.data || [];
        const misEntregas: EntregaResponse[] = res.entregas?.data || [];

        // IMPORTANTE: Ahora filtramos con la lógica corregida de "Tarea Global"
        this.filas = tareas
          .filter(t => this.esTareaVisibleParaAlumno(t, misAsig, misEntregas))
          .map(t => this.mapearFilaAlumno(t, misEntregas));

        this.finalizarCarga();
      },
      error: (err) => this.manejarError(err)
    });
  }

  /**
   * Obtiene todos los alumnos, las asignaciones de la tarea y las entregas realizadas.
   * @param idTarea ID de la tarea a consultar.
   */
  private cargarModoTarea(idTarea: number): void {
    forkJoin({
      usuariosTaller: this.usuarioService.listarPorTaller(this.idTaller),
      asignaciones: this.tareaAsignadaService.listarPorTarea(idTarea).pipe(
        catchError(() => of({ data: [] }))
      ),
      entregas: this.entregaService.listarPorTarea(idTarea),
      tarea: this.tareaService.obtenerPorId(idTarea)
    }).subscribe({
      next: (res: any) => {
        this.tarea = res.tarea?.data;
        const asignaciones: TareaAsignadaResponse[] = res.asignaciones?.data || [];
        const entregas: EntregaResponse[] = res.entregas?.data || [];
        const alumnosTaller = (res.usuariosTaller?.data || [])
          .filter((u: UsuarioResponse) => u.nombreRol?.toUpperCase() === 'ALUMNO');


        this.filas = this.generarListaBaseTarea(alumnosTaller, asignaciones)
          .map(asig => this.mapearFilaTarea(asig, entregas));

        this.finalizarCarga();
      },
      error: (err) => this.manejarError(err)
    });
  }

  // --- MÉTODOS PRIVADOS DE LÓGICA Y TRANSFORMACIÓN ---

  /**
  * Valida si una tarea debe aparecer en el expediente basándose en:
  * 1. Si está marcada como visible por el profesor.
  * 2. Si el alumno ya la ha entregado (aunque ya no esté asignada, debe verse la nota).
  * 3. Si el alumno está asignado específicamente.
  * 4. SI LA TAREA ES GLOBAL (No tiene ninguna asignación específica creada).
  * * @param t Tarea a validar.
  * @param misAsig Lista de asignaciones del alumno.
  * @param misEntregas Lista de entregas del alumno.
  */
  private esTareaVisibleParaAlumno(t: TareaResponse, misAsig: TareaAsignadaResponse[], misEntregas: EntregaResponse[]): boolean {
    if (t.visible === false) return false;

    return misEntregas.some(e => String(e.idTarea) === String(t.idTarea)) || 
      misAsig.some(a => String(a.idTarea) === String(t.idTarea)) ||   
      (!t.alumnosAsignadosIds || t.alumnosAsignadosIds.length === 0);  
  }

  /**
   * Transforma una tarea en un objeto legible por la tabla del expediente.
   * @param t Metadatos de la tarea.
   * @param misEntregas Historial de entregas del alumno.
   */
  private mapearFilaAlumno(t: TareaResponse, misEntregas: EntregaResponse[]) {
    const entrega = misEntregas.find(e => String(e.idTarea) === String(t.idTarea));
    return {
      alumno: this.alumnoExpediente,
      tituloRow: t.titulo,
      subtituloRow: 'Actividad del curso',
      entrega: entrega || null,
      estado: this.definirEstado(entrega)
    };
  }

  /**
   * Determina quiénes deben aparecer en el seguimiento de la tarea.
   * @param alumnosTaller Lista total de alumnos inscritos.
   * @param asignaciones Alumnos asignados específicamente a esta tarea.
   */
  private generarListaBaseTarea(alumnosTaller: UsuarioResponse[], asignaciones: TareaAsignadaResponse[]): any[] {
    if (asignaciones.length > 0) return asignaciones;

    return alumnosTaller.map(u => ({
      idAlumno: u.idUsuario,
      nombreAlumno: u.nombre,
      apellidosAlumno: u.apellidos,
      fotoAlumno: u.fotoPerfilRuta,
      emailAlumno: u.email
    }));
  }

  /**
   * Une los datos de un alumno/asignación con su entrega correspondiente.
   * @param asig Datos básicos del alumno (procedente de Usuarios o Asignaciones).
   * @param entregas Lista de entregas de la tarea.
   */
  private mapearFilaTarea(asig: any, entregas: EntregaResponse[]) {
    const entrega = entregas.find(e => String(e.idUsuario) === String(asig.idAlumno));
    return {
      alumno: {
        idUsuario: asig.idAlumno,
        nombre: asig.nombreAlumno,
        apellidos: asig.apellidosAlumno,
        fotoPerfilRuta: asig.fotoAlumno,
        email: asig.emailAlumno
      },
      tituloRow: `${asig.nombreAlumno} ${asig.apellidosAlumno}`,
      subtituloRow: asig.emailAlumno || 'Alumno inscrito',
      entrega: entrega || null,
      estado: this.definirEstado(entrega)
    };
  }

  // --- MÉTODOS DE UTILIDAD Y UI ---

  /**
   * Detiene el estado de carga y refresca la vista.
   */
  private finalizarCarga(): void {
    this.cargando = false;
    this.cdr.detectChanges();
  }

  /**
   * Gestiona errores de red o lógica, asegurando que la UI no quede bloqueada.
   */
  private manejarError(err: any): void {
    console.error("Error crítico en sincronización:", err);
    this.cargando = false;
    this.cdr.detectChanges();
  }

  /**
   * Calcula el estado visual (Badge) según la entrega y calificación.
   * @param entrega Objeto de entrega o null.
   */
  private definirEstado(entrega: EntregaResponse | undefined | null): string {
    if (!entrega) return 'PENDIENTE';
    if (entrega.calificacion !== null && entrega.calificacion !== undefined) return 'CALIFICADO';
    return 'ENTREGADO';
  }

  /**
   * Calcula el porcentaje o total de entregas para la cabecera.
   */
  get totalEntregados(): number {
    return this.filas.filter((f: any) => f.entrega !== null).length;
  }

  /**
   * Abre el modal de calificación inyectando la entrega seleccionada.
   * @param fila Datos de la fila de la tabla.
   */
  abrirCalificador(fila: any): void {
    if (fila.entrega) {
      this.entregaSeleccionada = fila.entrega;
      this.mostrarModalCalificar = true;
      this.cdr.detectChanges();
    }
  }

  /**
   * Navega hacia atrás según el flujo de procedencia.
   */
  volver(): void {
    const ruta = this.modoAlumno ? 'calificaciones' : 'tareas';
    this.router.navigate(['/aula-virtual', this.idTaller, ruta]);
  }
}