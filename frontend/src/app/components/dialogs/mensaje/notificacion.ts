import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Observable } from 'rxjs';
import { ModalConfig } from '../../../interfaces/Modal.Interface';

/**
 * COMPONENTE DE UI: Sistema de Alertas y Mensajería (Toast/Modal).
 * * Este componente actúa como el consumidor del estado global de notificaciones:
 * 1. Reactividad: Se suscribe al flujo de datos del servicio para mostrar mensajes.
 * 2. Polimorfismo: Adapta su estilo visual según el tipo (Éxito, Error, Info).
 * 3. Gestión de Ciclo: Controla la destrucción y cierre de la alerta desde la vista.
 */
@Component({
  selector: 'app-modal-notificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion.html',
  styleUrl: './notificacion.scss'
})
export class Notificacion {

  // --- Propiedades de Estado ---
  public config$: Observable<ModalConfig | null>; // Stream reactivo con la configuración de la alerta

  /**
   * @param notificacionService Fuente de datos para la emisión de mensajes del sistema.
   */
  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.modalState$;
  }

  // ===========================================================================
  // --- CONTROL DE FLUJO ---
  // ===========================================================================

  /**
   * Notifica al servicio la intención de cierre del usuario.
   * Esto limpia el estado global y oculta el componente de la vista.
   */
  cerrar(): void {
    this.notificacionService.cerrar();
  }
}