import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  // El Subject que maneja el dato (privado)
  private recursoNombreSource = new BehaviorSubject<string>('');

  // El Observable al que se suscribe el AulaVirtual
  recursoNombre$ = this.recursoNombreSource.asObservable();

  constructor() {}

  /**
   * Método para actualizar el nombre desde AulaDetalle
   * @param nombre Título de la tarea o material
   */
  setRecursoNombre(nombre: string) {
    this.recursoNombreSource.next(nombre);
  }
}