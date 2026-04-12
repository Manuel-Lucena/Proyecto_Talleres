import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HorarioResponse } from '../../interfaces/Horario.Interface';
import { HorarioService } from '../../services/Horario.Service';
import { TokenService } from '../../services/Token.Service';
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
  
  // Guardamos la lista completa de mis inscripciones
  todasMisInscripciones: HorarioResponse[] = [];
  // Esta es la lista que se mostrará en el HTML (puede estar filtrada)
  horariosParaMostrar: HorarioResponse[] = [];
  
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  talleresDisponibles: string[] = [];
  cargando = true;

  constructor(
    private horarioService: HorarioService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const idUser = this.tokenService.getId();
    
    this.horarioService.listarPorUsuario(idUser).subscribe({
      next: (resp) => {
        this.todasMisInscripciones = resp.data;
        this.horariosParaMostrar = [...this.todasMisInscripciones];
        
        // Sacamos los nombres únicos de mis talleres para el select
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
   * Se ejecuta cuando el usuario cambia el taller en el select
   */
  onFiltroChange(event: any) {
    const tallerSeleccionado = event.target.value;

    if (!tallerSeleccionado) {
      // Si elige "Todos los talleres", restauramos la lista completa
      this.horariosParaMostrar = [...this.todasMisInscripciones];
    } else {
      // Filtramos la lista original según el nombre del taller
      this.horariosParaMostrar = this.todasMisInscripciones.filter(
        h => h.nombreTaller === tallerSeleccionado
      );
    }
  }

  /**
   * Filtra los horarios para una columna (día) específica
   */
  filtrarPorDia(dia: string) {
    return this.horariosParaMostrar
      .filter(h => h.diaSemana.toLowerCase() === dia.toLowerCase())
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }
}