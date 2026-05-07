import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from "../../components/layout/navbar/navbar";

/**
 * Componente contenedor (Layout) para el panel de administración.
 * Gestiona la estructura de la página, la navegación lateral (Sidebar) 
 * y la adaptabilidad para dispositivos móviles.
 */
@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Navbar],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss',
})
export class PanelAdmin {

  // --- Propiedades de UI y UX ---
  sidebarColapsado = false; // Estado de la barra lateral en resoluciones de escritorio
  menuMovilAbierto = false; // Estado del menú desplegable en resoluciones móviles

  /**
   * Alterna el estado de la barra lateral entre expandida y contraída.
   * Utilizado para maximizar el espacio de trabajo en el contenido principal.
   */
  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  /**
   * Gestiona la apertura y cierre del menú en móviles.
   * Implementa una lógica de bloqueo de scroll en el body para evitar el 
   * desplazamiento de fondo mientras el menú está superpuesto.
   */
  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;

    if (this.menuMovilAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}