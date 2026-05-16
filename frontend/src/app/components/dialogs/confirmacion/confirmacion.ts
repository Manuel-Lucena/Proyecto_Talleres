import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Observable } from 'rxjs';
import { ConfirmacionConfig } from '../../../interfaces/Modal.Interface';

/**
 * DIÁLOGO DE CONFIRMACIÓN: Gestión de decisiones binarias (Aceptar/Cancelar) mediante promesas.
 */
@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion {

  // --- Propiedades de Estado ---
  public config$: Observable<ConfirmacionConfig | null>; 

  /**
   * @param notificacionService Servicio central de mensajes para capturar peticiones de confirmación.
   */
  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.confirmacionState$;
  }

  // ===========================================================================
  // --- GESTIÓN DE RESPUESTA ---
  // ===========================================================================

  /**
   * Envía la decisión del usuario al servicio para resolver la suscripción pendiente.
   * @param respuesta True para confirmar la acción, False para abortar.
   */
  responder(respuesta: boolean): void {
    this.notificacionService.responderConfirmacion(respuesta);
  }
}