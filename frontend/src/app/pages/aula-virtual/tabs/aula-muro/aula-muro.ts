import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { MaterialService } from '../../../../services/Material.Service'; 
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs'; 
@Component({
  selector: 'app-aula-muro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-muro.html',
  styleUrl: './aula-muro.scss',
})
export class AulaMuro implements OnInit {
  actividades: any[] = [];
  cargando: boolean = true;

  constructor(
    private tareaService: TareaService,
    private materialService: MaterialService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.cargarMuro(Number(idTaller));
    }
  }

  cargarMuro(id: number): void {
    this.cargando = true;

    // Lanzamos las dos llamadas en paralelo
    forkJoin({
      tareas: this.tareaService.listarPorTaller(id),
      materiales: this.materialService.listarPorTaller(id) // Ajusta según tu método
    }).subscribe({
      next: (res) => {
        // Marcamos cada uno para saber qué es en el HTML
        const tareasMapped = res.tareas.data.map(t => ({ ...t, tipo: 'TAREA', fechaMuro: new Date(t.fechaPublicacion || t.fechaEntrega) }));
        const materialesMapped = res.materiales.data.map(m => ({ ...m, tipo: 'MATERIAL', fechaMuro: new Date(m.fechaSubida) }));

        // Mezclamos y ordenamos por fecha (más reciente primero)
        this.actividades = [...tareasMapped, ...materialesMapped].sort((a, b) =>
          b.fechaMuro.getTime() - a.fechaMuro.getTime()
        );

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en el muro', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(item: any): void {
    const idRecurso = item.tipo === 'TAREA' ? item.idTarea : item.id;

    const tipoUrl = item.tipo.toLowerCase();

    this.router.navigate(['../detalle', tipoUrl, idRecurso], {
      relativeTo: this.route
    });
  }
}