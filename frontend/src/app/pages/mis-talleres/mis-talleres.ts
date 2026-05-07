import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';
import { TallerService } from '../../services/Taller.Service';
import { TokenService } from '../../services/Token.Service';
import { TallerResponse } from '../../interfaces/Taller.Interface';
import { HorarioTaller } from "../../components/dialogs/horario-taller/horario-taller";

/**
 * Componente de vista de usuario (Alumno).
 * Centraliza el acceso a los talleres donde el alumno está matriculado, 
 * actuando como lanzador hacia las diferentes secciones del Aula Virtual.
 */
@Component({
  selector: 'app-mis-talleres',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule, HorarioTaller],
  templateUrl: './mis-talleres.html',
  styleUrl: './mis-talleres.scss'
})
export class MisTalleres implements OnInit {

  // --- Estado de Datos ---
  talleres: TallerResponse[] = []; // Almacena los talleres vinculados al perfil del alumno
  cargando: boolean = true;        // Gestiona el estado de espera (Skeleton o Spinner en el HTML)

  // --- Estado de UI (Modales) ---
  mostrarModalHorario: boolean = false;  // Controla el renderizado condicional del modal de horarios
  idTallerSeleccionado!: number;         // Contexto de ID para el componente hijo (HorarioTaller)
  nombreTallerSeleccionado: string = ''; // Contexto de nombre para el encabezado del modal

  /**
   * @param tallerService Consultas específicas de talleres (filtrado por usuario).
   * @param tokenService Extracción de metadatos del JWT (ID del usuario).
   * @param router Gestión de rutas hacia el entorno de aprendizaje.
   * @param cdr Forzado de detección de cambios (crucial para estados de carga asíncronos).
   */
  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Al inicializar, obtiene el ID del usuario desde el token de sesión.
   * Si no hay sesión, detiene la carga para mostrar el estado vacío o redirigir.
   */
  ngOnInit(): void {
    const idUsuario = this.tokenService.getId();
    const rol = this.tokenService.getRol();

    if (rol === 'ADMIN') {
      this.cargarTodosLosTalleres();
    } else if (rol === 'PROFESOR' && idUsuario) {
      this.cargarTalleresProfesor(Number(idUsuario));
    } else if (idUsuario) {
      this.cargarMisTalleres(Number(idUsuario));
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  /**
 * Nueva función para que el Admin vea todo el catálogo activo
 */
  cargarTodosLosTalleres(): void {
    this.cargando = true;
    this.tallerService.listarTodos().subscribe({
      next: (resp) => {
        this.talleres = resp.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando todos los talleres", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Recupera del backend la colección de talleres activos para el alumno actual.
   * @param id Identificador numérico extraído del TokenService.
   */
  cargarMisTalleres(id: number): void {
    this.cargando = true;
    this.tallerService.listarPorUsuario(id).subscribe({
      next: (resp) => {
        this.talleres = resp.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando talleres", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Recupera del backend los talleres asignados al profesor actual.
   * Filtra aquellos cursos donde el usuario figura como docente responsable.
   * @param idProfesor Identificador numérico del docente extraído del TokenService.
   */
  cargarTalleresProfesor(idProfesor: number): void {
    this.cargando = true;
    this.tallerService.listarPorProfesor(idProfesor).subscribe({
      next: (resp) => {
        this.talleres = resp.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando talleres del profesor", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE INTERACCIÓN Y MODALES ---
  // ===========================================================================

  /**
   * Prepara los datos necesarios para inyectarlos en el modal de horarios.
   * @param item Objeto TallerResponse obtenido de la iteración en el template.
   */
  verHorario(item: TallerResponse): void {
    this.idTallerSeleccionado = item.idTaller;
    this.nombreTallerSeleccionado = item.nombre;
    this.mostrarModalHorario = true;
    this.cdr.detectChanges();
  }

  // ===========================================================================
  // --- NAVEGACIÓN AULA VIRTUAL ---
  // ===========================================================================

  /**
   * Acceso general al Dashboard del taller.
   */
  entrarAlAula(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller]);
  }

  /**
   * Acceso directo al submódulo de entregas y actividades.
   */
  verTareas(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller, 'tareas']);
  }

  /**
   * Acceso directo al repositorio de archivos y documentos del profesor.
   */
  verRecursos(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller, 'recursos']);
  }
}