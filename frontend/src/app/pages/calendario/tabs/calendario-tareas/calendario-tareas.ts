import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TallerService } from '../../../../services/Taller.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { TokenService } from '../../../../services/Token.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendario-tareas',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './calendario-tareas.html',
  styleUrl: './calendario-tareas.scss'
})
export class CalendarioTareas implements OnInit {
  tareasGlobales: TareaResponse[] = [];
  cargando = true;
  
  // Lógica de Calendario
  fechaVisual: Date = new Date();
  diasCalendario: any[] = [];
  nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(
    private tallerService: TallerService,
    private tareaService: TareaService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas() {
    const idUser = this.tokenService.getId();
    if (!idUser) return;

    this.tallerService.listarPorUsuario(idUser).pipe(
      switchMap(resp => {
        const talleres = resp?.data || [];
        if (talleres.length === 0) return of([]);
        const peticiones = talleres.map(taller => {
          const idTaller = (taller as any).idTaller || (taller as any).id;
          return this.tareaService.listarVisibles(idTaller, idUser).pipe(
            map(res => (res.data || []).map(t => ({...t, nombreTaller: taller.nombre}))),
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

  renderizarCalendario() {
    const año = this.fechaVisual.getFullYear();
    const mes = this.fechaVisual.getMonth();
    
    // Primer día del mes
    const primerDiaMes = new Date(año, mes, 1);
    // Ajuste para que Lunes sea 0
    let diaInicio = primerDiaMes.getDay() - 1;
    if (diaInicio === -1) diaInicio = 6;

    const ultimoDiaMes = new Date(año, mes + 1, 0).getDate();
    this.diasCalendario = [];

    // Rellenar días vacíos al inicio
    for (let i = 0; i < diaInicio; i++) {
      this.diasCalendario.push({ dia: null, tareas: [] });
    }

    // Rellenar días con tareas
    for (let i = 1; i <= ultimoDiaMes; i++) {
      const fechaDia = new Date(año, mes, i);
      const tareasDia = this.tareasGlobales.filter(t => {
        const fEntrega = new Date(t.fechaEntrega);
        return fEntrega.getDate() === i && fEntrega.getMonth() === mes && fEntrega.getFullYear() === año;
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

  cambiarMes(delta: number) {
    this.fechaVisual = new Date(this.fechaVisual.setMonth(this.fechaVisual.getMonth() + delta));
    this.renderizarCalendario();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  irATarea(tarea: TareaResponse) {
  this.router.navigate([`/aula-virtual/${tarea.idTaller}/detalle/tarea/${tarea.idTarea}`]);
}
}