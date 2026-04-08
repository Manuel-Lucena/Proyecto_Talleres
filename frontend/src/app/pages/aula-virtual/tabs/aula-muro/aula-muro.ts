import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { MaterialService } from '../../../../services/Material.Service';
import { TokenService } from '../../../../services/Token.Service'; // <--- Importamos tu servicio
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
  esProfesor: boolean = false;

  constructor(
    private tareaService: TareaService,
    private materialService: MaterialService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Comprobamos el rol real desde el JWT
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.cargarMuro(Number(idTaller));
    }
  }

  cargarMuro(idTaller: number): void {
    this.cargando = true;
    const idAlumno = this.tokenService.getId();
   
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
        // Mapeo de TAREAS
        const tareasMapped = res.tareas.data.map(t => ({
          ...t,
          tipo: 'TAREA',
          fechaMuro: new Date(t.fechaPublicacion || (t as any).createdAt || new Date())
        }));

        // Mapeo de MATERIALES
        const materialesMapped = res.materiales.data.map(m => ({
          ...m,
          tipo: 'MATERIAL',
          fechaMuro: new Date((m as any).fechaSubida || (m as any).createdAt || new Date())
        }));

        // Mezcla y ordenación
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

  verDetalle(item: any): void {
    const idRecurso = item.tipo === 'TAREA' ? item.idTarea : item.id;
    const tipoUrl = item.tipo.toLowerCase();

    this.router.navigate(['../detalle', tipoUrl, idRecurso], {
      relativeTo: this.route
    });
  }
}