import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';
import { TallerService } from '../../services/Taller.Service';
import { TokenService } from '../../services/Token.Service';
import { TallerResponse } from '../../interfaces/Taller.Interface';

@Component({
  selector: 'app-mis-talleres',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './mis-talleres.html',
  styleUrl: './mis-talleres.scss'
})
export class MisTalleres implements OnInit {
  talleres: TallerResponse[] = [];
  cargando: boolean = true;

  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Inyéctalo aquí
  ) {}

  ngOnInit(): void {
    const idUsuario = this.tokenService.getId();
    if (idUsuario) {
      this.cargarMisTalleres(Number(idUsuario));
    } else {
      this.cargando = false;
      this.cdr.detectChanges(); // Avisamos del cambio
    }
  }

  cargarMisTalleres(id: number): void {
    // Nos aseguramos de que el estado inicial sea consistente
    this.cargando = true;

    this.tallerService.listarPorUsuario(id).subscribe({
      next: (resp) => {
        this.talleres = resp.data;
        this.cargando = false;
        this.cdr.detectChanges(); // 3. Forzamos la actualización de la vista
      },
      error: (err) => {
        console.error("Error cargando talleres", err);
        this.cargando = false;
        this.cdr.detectChanges(); // También en caso de error
      }
    });
  }

  entrarAlAula(idTaller: number): void {
    this.router.navigate(['/mi-taller', idTaller]); 
  }

  verTareas(idTaller: number): void { console.log("Tareas:", idTaller); }
  verHorario(idTaller: number): void { console.log("Horario:", idTaller); }
  verRecursos(idTaller: number): void { console.log("Recursos:", idTaller); }
}