import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HorarioResponse } from '../../../../interfaces/Horario.Interface';
import { HorarioService } from '../../../../services/Horario.Service';
import { TokenService } from '../../../../services/Token.Service';
import { CommonModule } from '@angular/common';

/**
 * Componente de visualización de agenda personal.
 * Detecta automáticamente si el usuario es ALUMNO (talleres inscritos)
 * o PROFESOR (talleres impartidos) para mostrar el horario correspondiente.
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-talleres.html',
  styleUrl: './calendario-talleres.scss',
})
export class CalendarioTalleres implements OnInit {

  // --- Colecciones de Datos ---
  todasMisInscripciones: HorarioResponse[] = []; // Fuente de verdad (cache local)
  horariosParaMostrar: HorarioResponse[] = [];   // Datos vinculados al renderizado
  talleresDisponibles: string[] = [];            // Etiquetas para el dropdown de filtros

  // --- Configuración y Estado ---
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  cargando = true;

  /**
   * @param horarioService Acceso a los endpoints de agenda (usuario/profesor).
   * @param tokenService Identificación del usuario y su rol (JWT).
   * @param cdr Detección de cambios manual.
   */
  constructor(
    private horarioService: HorarioService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Carga la configuración horaria según el perfil del usuario.
   */
  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Recupera los horarios discriminando por rol:
   * - Alumno: talleres inscritos.
   * - Profesor: talleres que imparte.
   */
  cargarDatos(): void {
    const idUser = this.tokenService.getId();
    const rol = this.tokenService.getRol(); 

    if (!idUser) return;

    this.cargando = true;


    const peticion$ = (rol === 'PROFESOR' || rol === 'ADMIN')
      ? this.horarioService.listarPorProfesor(idUser)
      : this.horarioService.listarPorUsuario(idUser);

    peticion$.subscribe({
      next: (resp) => {
        this.todasMisInscripciones = resp.data || [];
        this.horariosParaMostrar = [...this.todasMisInscripciones];


        this.talleresDisponibles = [...new Set(this.todasMisInscripciones.map(h => h.nombreTaller))];

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando agenda:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE FILTROS Y RENDIMIENTO ---
  // ===========================================================================

  /**
   * Filtra la colección local basándose en la selección del usuario.
   * @param event Evento de cambio del elemento <select>.
   */
  onFiltroChange(event: any): void {
    const tallerSeleccionado = event.target.value;
    if (!tallerSeleccionado) {
      this.horariosParaMostrar = [...this.todasMisInscripciones];
    } else {
      this.horariosParaMostrar = this.todasMisInscripciones.filter(
        h => h.nombreTaller === tallerSeleccionado
      );
    }
  }

  /**
   * Orquestador de celdas por día.
   * Realiza un filtrado por día y una ordenación cronológica ascendente.
   * @param dia Día de la semana a procesar.
   */
  filtrarPorDia(dia: string): HorarioResponse[] {
    return this.horariosParaMostrar
      .filter(h => h.diaSemana.toLowerCase() === dia.toLowerCase())
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  // ===========================================================================
  // --- EXPORTACIÓN ---
  // ===========================================================================

  /**
   * Solicita el flujo binario (Blob) del PDF. 
   * El backend ya debería estar preparado para generar el PDF según el rol.
   */
  descargarAgenda(): void {
    const idUser = this.tokenService.getId();
    if (!idUser) return;

    this.horarioService.descargarAgendaPdf(idUser).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fecha = new Date().toLocaleDateString().replace(/\//g, '-');

        const nombreArchivo = this.tokenService.getRol() === 'PROFESOR' ? 'Agenda_Docente' : 'Mi_Agenda';
        link.download = `${nombreArchivo}_${fecha}.pdf`;

        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al generar el documento de agenda:', err);
      }
    });
  }
}