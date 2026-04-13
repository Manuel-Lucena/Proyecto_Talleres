import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';

/**
 * Componente del Aula Virtual para visualizar el listado de participantes.
 * Organiza y separa a los usuarios inscritos en categorías de profesores y alumnos
 * basándose en su rol asignado.
 */
@Component({
  selector: 'app-aula-participantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-participantes.html',
  styleUrl: './aula-participantes.scss',
})
export class AulaParticipantes implements OnInit {
  idTaller!: number; // Identificador del taller recuperado de la ruta padre
  profesores: UsuarioResponse[] = []; // Colección de usuarios con rol de profesor
  alumnos: UsuarioResponse[] = []; // Colección de usuarios con rol de alumno
  cargando: boolean = true; // Estado de carga para la visualización de skeletons o spinners

  /**
   * @param route Acceso a los parámetros de la ruta padre para obtener el ID del taller.
   * @param usuarioService Servicio para la recuperación de participantes del taller.
   * @param cdr Referencia para la detección manual de cambios tras procesos asíncronos.
   */
  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente capturando el contexto del taller e iniciando la carga.
   */
  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarParticipantes();
    }
  }

  /**
   * Recupera todos los inscritos en el taller y los clasifica por tipo de rol.
   * Excluye otros roles administrativos para mantener el enfoque académico del aula.
   */
  cargarParticipantes(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        const participantes = resp.data || [];

        // Clasificación por roles específicos
        this.profesores = participantes.filter(u => u.nombreRol === 'PROFESOR');
        this.alumnos = participantes.filter(u => u.nombreRol === 'ALUMNO');

        this.cargando = false;
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