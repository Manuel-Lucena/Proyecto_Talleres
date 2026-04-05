import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; // Añadido Router

import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';

@Component({
  selector: 'app-aula-virtual',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule], 
  templateUrl: './aula-virtual.html',
  styleUrl: './aula-virtual.scss'
})
export class AulaVirtual implements OnInit {
  idTaller!: number;
  nombreTaller: string = 'Cargando taller...'; 
  pestanaActiva: string = 'muro'; 
  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router // Inyectamos el router para poder navegar
  ) {}

  ngOnInit(): void {
    // Obtenemos el ID de la URL
    // Usamos subscribe por si el ID cambia mientras estamos en la misma página
    this.route.paramMap.subscribe(params => {
      this.idTaller = Number(params.get('id'));
      // Aquí podrías llamar a un servicio para traer el nombre real del taller
      // this.tallerService.getById(this.idTaller).subscribe(...)
      this.nombreTaller = `Taller #${this.idTaller}`; 
    });
  }

  // FUNCIÓN PARA EL BOTÓN DE CREAR
  irACrear(tipo: 'tarea' | 'material'): void {
    if (!this.idTaller) return;

    // Navegación: /aula-virtual/1/detalle/tarea/nuevo
    this.router.navigate(['/aula-virtual', this.idTaller, 'detalle', tipo, 'nuevo']);
  }

  cambiarPestana(p: string): void {
    this.pestanaActiva = p;
  }
}