import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-aula-tareas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-tareas.html',
  styleUrl: './aula-tareas.scss',
})
export class AulaTareas implements OnInit {
  tareas: TareaResponse[] = [];
  cargando: boolean = true;

  constructor(
    private tareaService: TareaService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.listarTareas(Number(idTaller));
    }
  }

  listarTareas(id: number): void {
    this.cargando = true;
    this.tareaService.listarPorTaller(id).subscribe({
      next: (res) => {
        this.tareas = res.data;
        this.cargando = false;

        // 3. Forzar el refresco de la UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tareas', err);
        this.cargando = false;
        this.cdr.detectChanges(); // También en el error para ocultar el spinner
      }
    });
  }

  verDetalle(idMaterial: number) {
    this.router.navigate(['../detalle', 'tarea', idMaterial], {
      relativeTo: this.route
    });
  }
}