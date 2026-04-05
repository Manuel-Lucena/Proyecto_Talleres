import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';

@Component({
  selector: 'app-aula-participantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-participantes.html',
  styleUrl: './aula-participantes.scss',
})
export class AulaParticipantes implements OnInit {
  idTaller!: number;
  profesores: UsuarioResponse[] = [];
  alumnos: UsuarioResponse[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef // Inyectamos el detector de cambios
  ) { }

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarParticipantes();
    }
  }

  cargarParticipantes(): void {
    this.cargando = true;
    // Forzamos detección para mostrar el estado de carga
    this.cdr.detectChanges();

    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        const participantes = resp.data || [];

        // 1. Filtramos: Solo queremos PROFESORES (excluimos ADMIN)
        this.profesores = participantes.filter(u => u.nombreRol === 'PROFESOR');

        // 2. Filtramos: Solo ALUMNOS
        this.alumnos = participantes.filter(u => u.nombreRol === 'ALUMNO');

        this.cargando = false;

        // 3. Notificamos a Angular que los datos han cambiado
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar participantes:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}