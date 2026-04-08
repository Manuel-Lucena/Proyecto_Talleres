import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { TareaResponse } from '../../../../interfaces/Tarea.Interface';
import { TokenService } from '../../../../services/Token.Service'; // Importante
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
  esProfesor: boolean = false;

  constructor(
    private tareaService: TareaService,
    private tokenService: TokenService, // Inyectamos el servicio de tokens
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Detectamos el rol
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.listarTareas(Number(idTaller));
    }
  }

  listarTareas(id: number): void {
    this.cargando = true;

    const idAlumno = this.tokenService.getId();

    // Si es profesor traemos todas, si es alumno solo las visibles
    const obs = this.esProfesor
      ? this.tareaService.listarPorTaller(id)
      : this.tareaService.listarVisibles(id, idAlumno!);

    obs.subscribe({
      next: (res) => {
        this.tareas = res.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tareas', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(idTarea: number) {
    this.router.navigate(['../detalle', 'tarea', idTarea], {
      relativeTo: this.route
    });
  }
}