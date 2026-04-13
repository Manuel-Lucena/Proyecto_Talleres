import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from "../../components/layout/navbar/navbar";

/**
 * Componente contenedor para la administración del sistema.
 * Gestiona la disposición de la interfaz, incluyendo la barra lateral y el menú móvil.
 */
@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Navbar],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss',
})
export class PanelAdmin {
  sidebarColapsado = false; // Controla el ancho de la barra lateral en escritorio
  menuMovilAbierto = false; // Controla la visibilidad del menú en dispositivos móviles

  /**
   * Alterna el estado de expansión de la barra lateral.
   */
  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  /**
   * Alterna el menú móvil y gestiona el bloqueo del scroll en el cuerpo de la página.
   */
  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;

    // Bloqueo de scroll preventivo para mejorar la UX en menús superpuestos
    if (this.menuMovilAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}