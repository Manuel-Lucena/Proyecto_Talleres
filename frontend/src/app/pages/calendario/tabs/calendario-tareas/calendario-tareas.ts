import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TallerService } from '../../../../services/Taller.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { TokenService } from '../../../../services/Token.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { Router } from '@angular/router';

/**
 * Componente de Calendario de Tareas.
 * Centraliza las fechas de entrega de todos los talleres en los que el alumno
 * está inscrito, proporcionando una interfaz de cuadrícula mensual.
 */
@Component({
  selector: 'app-calendario-tareas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-tareas.html',
  styleUrl: './calendario-tareas.scss'
})
export class CalendarioTareas implements OnInit {

  // --- Estado de Datos ---
  tareasGlobales: TareaResponse[] = []; // Colección total de tareas de todos los talleres

  // --- Lógica de Calendario ---
  fechaVisual: Date = new Date();       // Fecha de referencia para el renderizado del mes
  diasCalendario: any[] = [];           // Listado de celdas (días) a dibujar en el grid
  nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // --- Estado de UI ---
  cargando = true;

  /**
   * @param tallerService Obtención de talleres del usuario.
   * @param tareaService Recuperación de tareas por taller.
   * @param tokenService Metadatos del usuario actual.
   * @param router Redirección al detalle de la tarea.
   * @param cdr Control de detección de cambios manual.
   */
  constructor(
    private tallerService: TallerService,
    private tareaService: TareaService,
    public tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Inicia la secuencia de carga de tareas multi-taller.
   */
  ngOnInit(): void {
    this.cargarTareas();
  }

  // ===========================================================================
  // --- NÚCLEO DE DATOS (RXJS) ---
  // ===========================================================================

  /**
   * Orquestación asíncrona:
   * 1. Obtiene los talleres del alumno.
   * 2. Por cada taller, dispara una petición de tareas visibles.
   * 3. Aplana los resultados en una única colección global.
   */
  /**
 * Orquestación asíncrona:
 * 1. Detecta el rol.
 * 2. Si es ALUMNO: Lista por sus inscripciones.
 * 3. Si es PROFESOR: Lista por los talleres que imparte.
 */
  cargarTareas() {
    const idUser = this.tokenService.getId();
    const rol = this.tokenService.getRol();
    if (!idUser) return;

    const talleres$ = (rol === 'PROFESOR' || rol === 'ADMIN')
      ? this.tallerService.listarPorProfesor(idUser)
      : this.tallerService.listarPorUsuario(idUser);

    talleres$.pipe(
      switchMap(resp => {
        const talleres = resp?.data || [];
        if (talleres.length === 0) return of([]);

        const peticiones = talleres.map(taller => {
          const idTaller = (taller as any).idTaller || (taller as any).id;


          const peticionTareas$ = (rol === 'PROFESOR')
            ? this.tareaService.listarPorTaller(idTaller)
            : this.tareaService.listarVisibles(idTaller);

          return peticionTareas$.pipe(
            map(res => (res.data || []).map(t => ({
              ...t,
              nombreTaller: taller.nombre,
              idTaller: idTaller
            }))),
            catchError(() => of([]))
          );
        });

        return forkJoin(peticiones);
      })
    ).subscribe({
      next: (res) => {
        this.tareasGlobales = res.flat();
        this.renderizarCalendario();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DEL CALENDARIO ---
  // ===========================================================================

  /**
   * Genera la estructura de celdas para el mes actual.
   * Calcula el offset inicial (días vacíos) y cruza cada día con las tareas globales.
   */
  renderizarCalendario() {
    const año = this.fechaVisual.getFullYear();
    const mes = this.fechaVisual.getMonth();

    const primerDiaMes = new Date(año, mes, 1);
    let diaInicio = primerDiaMes.getDay() - 1;
    if (diaInicio === -1) diaInicio = 6;

    const ultimoDiaMes = new Date(año, mes + 1, 0).getDate();
    this.diasCalendario = [];

    for (let i = 0; i < diaInicio; i++) {
      this.diasCalendario.push({ dia: null, tareas: [] });
    }

    for (let i = 1; i <= ultimoDiaMes; i++) {
      const fechaDia = new Date(año, mes, i);
      const tareasDia = this.tareasGlobales.filter(t => {
        const fEntrega = new Date(t.fechaEntrega);
        return fEntrega.getDate() === i &&
          fEntrega.getMonth() === mes &&
          fEntrega.getFullYear() === año;
      });

      this.diasCalendario.push({
        dia: i,
        fecha: fechaDia,
        tareas: tareasDia,
        hoy: this.esHoy(fechaDia)
      });
    }
    this.cdr.detectChanges();
  }

  /**
   * Navegación temporal del calendario.
   * @param delta Cantidad de meses a sumar o restar.
   */
  cambiarMes(delta: number) {
    this.fechaVisual = new Date(this.fechaVisual.setMonth(this.fechaVisual.getMonth() + delta));
    this.renderizarCalendario();
  }

  /**
   * Compara una fecha con el día actual del sistema.
   */
  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Redirige a la vista de detalle de la tarea seleccionada.
   */
  irATarea(tarea: TareaResponse) {
    const rol = this.tokenService.getRol();
    const idTaller = tarea.idTaller;
    const idTarea = tarea.idTarea;

    if (rol === 'PROFESOR' || rol === 'ADMIN') {
      this.router.navigate(['/aula-virtual', idTaller, 'tareas', idTarea, 'seguimiento']);
    } else {
      this.router.navigate(['/aula-virtual', idTaller, 'detalle', 'tarea', idTarea]);
    }
  }
}