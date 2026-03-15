import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from "../../components/layout/navbar/navbar";
import { Footer } from "../../components/layout/footer/footer";
import { TallerService } from "../../services/Taller.Service";
import { TallerResponse } from "../../interfaces/Taller.Interface";

@Component({
  selector: 'app-talleres-explorar',
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './talleres-explorar.html',
  styleUrl: './talleres-explorar.scss',
})
export class TalleresExplorar implements OnInit {
  
  talleres: TallerResponse[] = [];
  cargando: boolean = true;

  constructor(
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarTalleres();
  }

  cargarTalleres(): void {
    this.tallerService.listarTodos().subscribe({
      next: (response) => {
        this.talleres = response.data; 
        this.cargando = false;
        
        console.log('Talleres cargados:', this.talleres);
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al traer los talleres:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}