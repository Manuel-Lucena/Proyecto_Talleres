import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HorarioResponse } from '../../interfaces/Horario.Interface';
import { HorarioService } from '../../services/Horario.Service';
import { CommonModule } from '@angular/common';
import { Footer } from "../../components/layout/footer/footer";
import { Navbar } from "../../components/layout/navbar/navbar";

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, Footer, Navbar],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario implements OnInit {
  horarios: HorarioResponse[] = [];
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Filtros visuales para rellenar la toolbar
  talleresDisponibles: string[] = [];
  cargando = true;

  constructor(
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.horarioService.listar().subscribe({
      next: (resp) => {
        this.horarios = resp.data;
        // Extraemos nombres únicos para el selector visual
        this.talleresDisponibles = [...new Set(this.horarios.map(h => h.nombreTaller))];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorDia(dia: string) {
    return this.horarios
      .filter(h => h.diaSemana.toLowerCase() === dia.toLowerCase())
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  // Solo para que el HTML no de error al mover el selector
  onFiltroChange(event: any) {}
}