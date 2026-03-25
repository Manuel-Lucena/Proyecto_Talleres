import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { ConfirmacionConfig } from '../../../interfaces/Modal.Interface';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion {
  public config$: Observable<ConfirmacionConfig | null>;

  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.confirmacionState$;
  }

  responder(respuesta: boolean) {
    this.notificacionService.responderConfirmacion(respuesta);
  }
}