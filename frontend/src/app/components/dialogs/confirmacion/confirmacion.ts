import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Observable } from 'rxjs';
import { ConfirmacionConfig } from '../../../interfaces/Modal.Interface';

/**
 * Componente para la gestión visual de diálogos de confirmación dinámicos.
 */
@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion {
  
  public config$: Observable<ConfirmacionConfig | null>; // Estado y configuración del modal

  /**
   * @param notificacionService Servicio para suscribirse al estado global de confirmaciones.
   */
  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.confirmacionState$;
  }

  /**
   * Resuelve la promesa de confirmación según la interacción del usuario.
   * @param respuesta Booleano que indica aceptación o cancelación.
   */
  responder(respuesta: boolean): void {
    this.notificacionService.responderConfirmacion(respuesta);
  }
}