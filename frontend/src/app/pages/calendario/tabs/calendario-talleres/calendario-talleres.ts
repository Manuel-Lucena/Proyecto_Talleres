import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HorarioResponse } from '../../../../interfaces/Horario.Interface';
import { HorarioService } from '../../../../services/Horario.Service';
import { TokenService } from '../../../../services/Token.Service';
import { CommonModule } from '@angular/common';
import { Footer } from "../../../../components/layout/footer/footer";
import { Navbar } from "../../../../components/layout/navbar/navbar";

/**
 * Componente de visualización de agenda personal para el alumno.
 * Organiza los horarios de los talleres en una estructura de calendario semanal,
 * permitiendo el filtrado por curso específico y la exportación de la agenda a PDF.
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
  horariosParaMostrar: HorarioResponse[] = [];   // Datos vinculados al renderizado de la tabla
  talleresDisponibles: string[] = [];            // Etiquetas únicas para el dropdown de filtros

  // --- Configuración y Estado ---
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  cargando = true; 
  /**
   * @param horarioService Acceso a los endpoints de agenda y exportación PDF.
   * @param tokenService Identificación del usuario activo mediante el JWT.
   * @param cdr Forzado de detección de cambios para procesos asíncronos y ordenación manual.
   */
  constructor(
    private horarioService: HorarioService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Carga la configuración horaria completa del alumno al inicio.
   */
  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Recupera los horarios y pre-procesa la lista de talleres únicos para el filtro.
   */
  cargarDatos(): void {
    const idUser = this.tokenService.getId();
    
    this.horarioService.listarPorUsuario(idUser).subscribe({
      next: (resp) => {
        this.todasMisInscripciones = resp.data;
        this.horariosParaMostrar = [...this.todasMisInscripciones];
        
        // Utilizamos Set para garantizar que cada taller aparezca una sola vez en el filtro.
        this.talleresDisponibles = [...new Set(this.todasMisInscripciones.map(h => h.nombreTaller))];
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
   * Evita llamadas innecesarias al servidor al operar sobre la cache 'todasMisInscripciones'.
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
   * Realiza un filtrado por día y una ordenación cronológica ascendente (horaInicio).
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
   * Solicita el flujo binario (Blob) del PDF y gestiona la descarga en el navegador.
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
        link.download = `Mi_Agenda_${fecha}.pdf`;
        link.click();
        
        // Liberación de memoria tras la descarga
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al generar el documento de agenda:', err);
      }
    });
  }
}