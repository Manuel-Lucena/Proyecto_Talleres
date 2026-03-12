import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/Modal.Service';
import { Observable } from 'rxjs';
import { ModalConfig } from '../../../models/Modal.Interface';

@Component({
  selector: 'app-modal-mensaje',

  imports: [CommonModule],
  templateUrl: './mensaje.html',
  styleUrl: './mensaje.scss'
})
export class Mensaje {
  // Escuchamos el estado del modal desde el servicio
  public config$: Observable<ModalConfig | null>;

  constructor(private modalService: ModalService) {
    this.config$ = this.modalService.modalState$;
  }

  cerrar() {
    this.modalService.cerrar();
  }
}