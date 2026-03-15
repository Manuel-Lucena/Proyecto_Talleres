import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { Observable } from 'rxjs';
import { ModalConfig } from '../../../interfaces/Modal.Interface';

@Component({
  selector: 'app-modal-notificacion',
  imports: [CommonModule],
  templateUrl: './notificacion.html',
  styleUrl: './notificacion.scss'
})
export class Notificacion {
  public config$: Observable<ModalConfig | null>;

  constructor(private notificacionService: NotificacionService) {
    this.config$ = this.notificacionService.modalState$;
  }

  cerrar() {
    this.notificacionService.cerrar();
  }
}