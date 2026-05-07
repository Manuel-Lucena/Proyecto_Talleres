import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';

/**
 * VISTA DE GESTIÓN DE COMUNIDAD: Listado de Participantes.
 * * Este componente orquesta la visualización de la estructura humana del taller:
 * 1. Resolución de Contexto: Accede al ID del taller mediante la jerarquía de rutas (Parent Route).
 * 2. Clasificación de Datos: Segmenta el DTO de respuesta en colecciones tipadas por Rol.
 * 3. Gestión de Estado Síncrono: Controla el ciclo de vida de la carga para evitar inconsistencias visuales.
 */
@Component({
  selector: 'app-aula-participantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-participantes.html',
  styleUrl: './aula-participantes.scss',
})
export class AulaParticipantes implements OnInit {

  // --- Propiedades de Datos ---
  idTaller!: number;                          // Identificador único recuperado del Snapshot
  profesores: UsuarioResponse[] = [];         // Colección filtrada de personal docente
  alumnos: UsuarioResponse[] = [];            // Colección filtrada de usuarios discentes

  // --- Propiedades de Estado y UI ---
  cargando: boolean = true;                   // Flag de control para refrescar la vista

  /**
   * @param route Inyección de la ruta activa para la captura de parámetros de la URL.
   * @param usuarioService Abstracción de la API para la recuperación de inscritos.
   * @param cdr Servicio de detección de cambios para forzar el renderizado tras procesos asíncronos.
   */
  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicialización del componente:
   * Implementa la captura del parámetro 'id' desde el 'parent snapshot', asegurando 
   * que el componente hijo tenga acceso al contexto del aula virtual.
   */
  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarParticipantes();
    }
  }

  // ===========================================================================
  // --- CAPA DE SERVICIO Y LÓGICA DE NEGOCIO ---
  // ===========================================================================

  /**
   * Ejecuta la petición al servicio de usuarios y aplica la lógica de filtrado reactivo.
   * * Se utiliza el discriminador 'nombreRol' para segregar el payload 
   * y alimentar las listas específicas de la interfaz de usuario.
   */
  cargarParticipantes(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        const participantes = resp.data || [];

        this.profesores = participantes.filter(u => u.nombreRol === 'PROFESOR');
        this.alumnos = participantes.filter(u => u.nombreRol === 'ALUMNO');

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CRITICAL: Fallo en la recuperación de participantes del taller:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}