import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioService } from '../../../services/Horario.Service';
import { HorarioResponse } from '../../../interfaces/Horario.Interface';

@Component({
  selector: 'app-horario-taller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horario-taller.html',
  styleUrl: './horario-taller.scss',
})
export class HorarioTaller implements OnInit {
  @Input() idTaller!: number;
  @Input() nombreTaller: string = '';
  @Output() cerrar = new EventEmitter<void>();

  horarios: HorarioResponse[] = [];
  cargando: boolean = true;


  constructor(
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    if (this.idTaller) {
      this.cargarHorarios();
    }
  }

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

  alCerrar(): void {
    this.cerrar.emit();
    this.cdr.detectChanges();
  }
}