import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenService } from '../../../services/Token.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Confirmacion } from "../../dialogs/confirmacion/confirmacion";

/**
 * COMPONENTE ESTRUCTURAL: Navegación Principal (Navbar).
 * * Este componente gestiona la persistencia visual y operativa de la sesión:
 * 1. Sincronización de Sesión: Valida el estado del JWT en el ciclo de inicialización.
 * 2. Recarga de Perfil: Recupera los datos del usuario en tiempo real tras el login.
 * 3. Control de UI: Gestiona menús contextuales y flujos de salida del sistema.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Confirmacion],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {

  // --- Propiedades de Estado y Sesión ---
  isLogged: boolean = false;        // Flag de control para vistas condicionales
  mostrarDropdown: boolean = false; // Toggle de estado para el menú de perfil
  usuarioData?: UsuarioResponse;    // DTO con la información del usuario activo

  /**
   * @param router Gestión de redirección hacia pasarelas de acceso.
   * @param tokenService Interfaz de acceso a la persistencia local del JWT.
   * @param usuarioService Servicio de dominio para la gestión de cuentas.
   * @param notify Servicio centralizado para feedback visual.
   * @param cdr Trigger manual para asegurar la paridad vista-modelo en cargas asíncronas.
   */
  constructor(
    private router: Router,
    public tokenService: TokenService,
    private usuarioService: UsuarioService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Evalúa la integridad de la sesión y dispara la carga de perfil 
   * si el motor de tokens confirma una identidad válida en el almacenamiento.
   */
  ngOnInit(): void {
    this.isLogged = this.tokenService.isLogged();
    if (this.isLogged) {
      this.cargarDatos();
    }
  }

  // ===========================================================================
  // --- CAPA DE DATOS Y PERFIL ---
  // ===========================================================================

  /**
   * Recupera la identidad completa del usuario a partir del ID codificado en el token.
   */
  private cargarDatos(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      this.usuarioService.obtenerPorId(userId).subscribe({
        next: (res) => {
          this.usuarioData = res.data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("ERROR: Fallo al sincronizar datos de perfil en Navbar", err);
        }
      });
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE INTERFAZ Y FLUJOS ---
  // ===========================================================================

  /**
   * Controla la apertura y cierre del menú desplegable del usuario.
   * Se detiene la propagación para evitar conflictos con listeners globales del DOM.
   */
  public toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  /**
   * Orquestador de cierre de sesión:
   * 1. Invalida las credenciales en el storage local.
   * 2. Resetea el estado interno del componente para seguridad de datos.
   * 3. Expulsa al usuario hacia la vista de login.
   */
  public async logout(): Promise<void> {

    const confirmar = await this.notify.confirmar({
      titulo: 'Cerrar Sesión',
      mensaje: '¿Estás seguro de que deseas salir de Aula Viva?'
    });

    if (confirmar) {
      this.tokenService.logOut();
      this.isLogged = false;
      this.usuarioData = undefined;
      this.router.navigate(['/login']);
    }
  }
}