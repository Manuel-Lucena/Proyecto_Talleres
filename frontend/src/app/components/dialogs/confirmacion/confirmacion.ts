import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ModalService } from '../../../services/Modal.Service';
import { ConfirmacionConfig } from '../../../models/Modal.Interface';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion {
  public config$: Observable<ConfirmacionConfig | null>;

  constructor(private modalService: ModalService) {
    this.config$ = this.modalService.confirmacionState$;
  }

  responder(respuesta: boolean) {
    this.modalService.responderConfirmacion(respuesta);
  }
}