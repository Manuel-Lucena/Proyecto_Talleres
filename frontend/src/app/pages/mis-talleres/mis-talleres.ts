import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';
import { TallerService } from '../../services/Taller.Service';
import { TokenService } from '../../services/Token.Service';
import { TallerResponse } from '../../interfaces/Taller.Interface';
import { HorarioTaller } from "../../components/dialogs/horario-taller/horario-taller";

@Component({
  selector: 'app-mis-talleres',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule, HorarioTaller],
  templateUrl: './mis-talleres.html',
  styleUrl: './mis-talleres.scss'
})
export class MisTalleres implements OnInit {
  talleres: TallerResponse[] = [];
  cargando: boolean = true;

  // Variables para el control del Modal de Horario
  mostrarModalHorario: boolean = false;
  idTallerSeleccionado!: number;
  nombreTallerSeleccionado: string = '';

  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    const idUsuario = this.tokenService.getId();
    if (idUsuario) {
      this.cargarMisTalleres(Number(idUsuario));
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

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

  // Función para abrir el modal pasando los datos del taller clickeado
  verHorario(item: TallerResponse): void { 
    this.idTallerSeleccionado = item.idTaller;
    this.nombreTallerSeleccionado = item.nombre;
    this.mostrarModalHorario = true;
    this.cdr.detectChanges(); 
  }

  entrarAlAula(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller]); 
  }


  verTareas(idTaller: number): void { console.log("Ver tareas de:", idTaller); }
  verRecursos(idTaller: number): void { console.log("Ver recursos de:", idTaller); }
}