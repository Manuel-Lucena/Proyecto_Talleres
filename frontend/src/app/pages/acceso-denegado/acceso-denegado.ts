import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Componente de seguridad visual para la gestión de errores de autorización (403 Forbidden).
 * Se presenta cuando un usuario autenticado intenta acceder a recursos 
 * que requieren un rol superior (ej: Alumno intentando entrar al Panel Admin).
 */
@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-denegado.html',
  styleUrl: './acceso-denegado.scss'
})
export class AccesoDenegado {

  /**
   * @param router Servicio para redirigir al usuario a una zona segura de la aplicación.
   */
  constructor(private router: Router) {}

  /**
   * Acción de retorno segura.
   * Redirige al usuario a la página de aterrizaje (Landing) para evitar 
   * que se quede atrapado en un bucle de error o una página en blanco.
   */
  irAlInicio(): void {
    this.router.navigate(['/landing']);
  }
}