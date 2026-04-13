import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HorarioResponse } from '../../interfaces/Horario.Interface';
import { HorarioService } from '../../services/Horario.Service';
import { TokenService } from '../../services/Token.Service';
import { CommonModule } from '@angular/common';
import { Footer } from "../../components/layout/footer/footer";
import { Navbar } from "../../components/layout/navbar/navbar";

/**
 * Componente que gestiona la agenda semanal personalizada del usuario.
 * Permite visualizar los horarios de los talleres en los que está inscrito y filtrarlos dinámicamente.
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, Footer, Navbar],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario implements OnInit {
  todasMisInscripciones: HorarioResponse[] = []; // Cache completa de horarios del usuario
  horariosParaMostrar: HorarioResponse[] = []; // Lista filtrada vinculada a la vista
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; // Columnas del calendario
  talleresDisponibles: string[] = []; // Nombres únicos de talleres para el selector de filtro
  cargando = true; // Estado de carga inicial de los datos

  /**
   * @param horarioService Servicio para la obtención de la agenda por usuario.
   * @param tokenService Gestión de sesión para identificar al usuario actual.
   * @param cdr Referencia para la detección manual de cambios tras procesos asíncronos.
   */
  constructor(
    private horarioService: HorarioService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa la carga de la agenda personal al montar el componente.
   */
  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Recupera los horarios del usuario desde el servidor y extrae los nombres de los talleres inscritos.
   */
  cargarDatos(): void {
    const idUser = this.tokenService.getId();
    
    this.horarioService.listarPorUsuario(idUser).subscribe({
      next: (resp) => {
        this.todasMisInscripciones = resp.data;
        this.horariosParaMostrar = [...this.todasMisInscripciones];
        
        // Generación de lista única de nombres para el filtro
        this.talleresDisponibles = [...new Set(this.todasMisInscripciones.map(h => h.nombreTaller))];
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  /**
   * Actualiza la visualización del calendario según el taller seleccionado en la interfaz.
   * @param event Evento del cambio en el select del DOM.
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
   * Filtra y ordena cronológicamente los horarios correspondientes a un día concreto.
   * @param dia Nombre del día de la semana.
   * @returns Colección de horarios filtrados y ordenados por hora de inicio.
   */
  filtrarPorDia(dia: string): HorarioResponse[] {
    return this.horariosParaMostrar
      .filter(h => h.diaSemana.toLowerCase() === dia.toLowerCase())
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }
}