import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-denegado.html',
  styleUrl: './acceso-denegado.scss'
})
export class AccesoDenegado {

  constructor(private router: Router) {}

  irAlInicio(): void {
    // Te mando a landing, pero podrías mandarlo a /mis-talleres si ya está logueado
    this.router.navigate(['/landing']);
  }
}