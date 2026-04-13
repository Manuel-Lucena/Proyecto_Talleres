import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioService } from '../../../services/Horario.Service';
import { HorarioResponse } from '../../../interfaces/Horario.Interface';

/**
 * Componente para visualizar el listado de horarios asociados a un taller.
 */
@Component({
  selector: 'app-horario-taller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horario-taller.html',
  styleUrl: './horario-taller.scss',
})
export class HorarioTaller implements OnInit {
  
  @Input() idTaller!: number; // ID para la consulta de horarios
  @Input() nombreTaller: string = ''; // Título para la interfaz
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre de la vista

  horarios: HorarioResponse[] = []; // Listado de horarios de la API
  cargando: boolean = true; // Estado de la petición asíncrona

  /**
   * @param horarioService Acceso a la API de horarios.
   * @param cdr Control manual de detección de cambios.
   */
  constructor(
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef 
  ) {}

  /**
   * Inicializa la carga de datos si existe un ID de taller válido.
   */
  ngOnInit(): void {
    if (this.idTaller) {
      this.cargarHorarios();
    }
  }

  /**
   * Recupera los horarios del servidor y actualiza el estado de carga.
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
        console.error("Error cargando horarios", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Gestiona la emisión del evento de cierre.
   */
  alCerrar(): void {
    this.cerrar.emit();
    this.cdr.detectChanges();
  }
}