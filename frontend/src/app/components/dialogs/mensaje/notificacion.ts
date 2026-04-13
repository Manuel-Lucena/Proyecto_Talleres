import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Observable } from 'rxjs';
import { ModalConfig } from '../../../interfaces/Modal.Interface';

/**
 * Componente para la visualización de notificaciones informativas (Éxito, Error, Info).
 */
@Component({
  selector: 'app-modal-notificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion.html',
  styleUrl: './notificacion.scss'
})
export class Notificacion {
  
  public config$: Observable<ModalConfig | null>; // Estado reactivo del mensaje y tipo de alerta

  /**
   * @param notificacionService Servicio para gestionar la emisión y cierre de mensajes.
   */
  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.modalState$;
  }

  /**
   * Solicita al servicio el cierre del modal actual.
   */
  cerrar(): void {
    this.notificacionService.cerrar();
  }
}