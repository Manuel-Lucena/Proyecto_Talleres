import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig, ConfirmacionConfig } from '../models/Modal.Interface';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // --- Lógica para Modal de Mensaje ---
  private modalSubject = new Subject<ModalConfig | null>();
  public modalState$ = this.modalSubject.asObservable();

  // --- Lógica para Confirmación ---
  private confirmacionSubject = new Subject<ConfirmacionConfig | null>();
  public confirmacionState$ = this.confirmacionSubject.asObservable();
  
  // Guardamos la función 'resolve' de la Promesa para llamarla después
  private resolverConfirmacion: ((res: boolean) => void) | null = null;

  // Métodos para Mensajes
  mostrar(config: ModalConfig) {
    this.modalSubject.next(config);
  }

  cerrar() {
    this.modalSubject.next(null);
  }

  // Métodos para Confirmación
  confirmar(config: ConfirmacionConfig): Promise<boolean> {
    this.confirmacionSubject.next(config);
    

    return new Promise((resolve) => {
      this.resolverConfirmacion = resolve;
    });
  }

  responderConfirmacion(respuesta: boolean) {
    this.confirmacionSubject.next(null); 
    if (this.resolverConfirmacion) {
      this.resolverConfirmacion(respuesta); 
      this.resolverConfirmacion = null;
    }
  }
}