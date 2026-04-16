import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioService } from '../../../services/Horario.Service';
import { HorarioResponse } from '../../../interfaces/Horario.Interface';

/**
 * VISUALIZADOR DE HORARIOS: Gestión y despliegue de sesiones programadas por taller.
 */
@Component({
  selector: 'app-horario-taller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horario-taller.html',
  styleUrl: './horario-taller.scss',
})
export class HorarioTaller implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() idTaller!: number;              // Identificador de contexto para la consulta
  @Input() nombreTaller: string = '';      // Etiqueta descriptiva para el encabezado
  @Output() cerrar = new EventEmitter<void>(); // Notificador de cierre para el componente padre

  // --- Propiedades de Datos y UI ---
  horarios: HorarioResponse[] = [];        // Colección de sesiones recuperadas
  cargando: boolean = true;                // Flag de control para el estado de carga

  /**
   * @param horarioService Abstracción de la API para la entidad Horario.
   * @param cdr Trigger manual para la detección de cambios tras respuesta asíncrona.
   */
  constructor(
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Ciclo de vida: Dispara la recarga de datos basándose en el ID de taller recibido.
   */
  ngOnInit(): void {
    if (this.idTaller) {
      this.cargarHorarios();
    }
  }

  // ===========================================================================
  // --- CAPA DE DATOS ---
  // ===========================================================================

  /**
   * Recupera la planificación horaria desde el servidor.
   */
  cargarHorarios(): void {
    this.cargando = true;
    this.horarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.horarios = resp.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("ERROR: Fallo al obtener horarios del taller", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE INTERFAZ ---
  // ===========================================================================

  /**
   * Emite el evento de salida para que el contenedor superior destruya la instancia.
   */
  alCerrar(): void {
    this.cerrar.emit();
  }
}