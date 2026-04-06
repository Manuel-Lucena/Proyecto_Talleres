import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig, ConfirmacionConfig } from '../interfaces/Modal.Interface';

/**
 * Servicio global para la gestión de notificaciones, modales informativos
 * y ventanas de confirmación dinámica en la aplicación.
 * Utiliza RxJS para comunicar el estado de los modales a los componentes de UI.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  
  /** Subject que controla el flujo de mensajes informativos (Éxito, Error, Info) */
  private modalSubject = new Subject<ModalConfig | null>();
  /** Observable para que los componentes se suscriban al estado del modal informativo */
  public modalState$ = this.modalSubject.asObservable();

  /** Subject que controla el flujo de los cuadros de diálogo de confirmación */
  private confirmacionSubject = new Subject<ConfirmacionConfig | null>();
  /** Observable para que los componentes escuchen peticiones de confirmación (Si/No) */
  public confirmacionState$ = this.confirmacionSubject.asObservable();
  
  /** Almacena la función de resolución de la promesa para gestionar la respuesta del usuario */
  private resolverConfirmacion: ((res: boolean) => void) | null = null;

  /**
   * Dispara un modal informativo en pantalla.
   * @param config Configuración del modal (título, mensaje, tipo).
   */
  mostrar(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  /**
   * Cierra el modal informativo activo.
   */
  cerrar(): void {
    this.modalSubject.next(null);
  }

  /**
   * Lanza un cuadro de diálogo de confirmación que espera la interacción del usuario.
   * @param config Configuración visual del mensaje de confirmación.
   * @returns Promesa que se resuelve con 'true' si el usuario confirma o 'false' si cancela.
   */
  confirmar(config: ConfirmacionConfig): Promise<boolean> {
    this.confirmacionSubject.next(config);
    
    return new Promise((resolve) => {
      this.resolverConfirmacion = resolve;
    });
  }

  /**
   * Captura la respuesta del usuario desde el componente de UI y resuelve la promesa pendiente.
   * @param respuesta Resultado de la interacción del usuario.
   */
  responderConfirmacion(respuesta: boolean): void {
    this.confirmacionSubject.next(null); 
    if (this.resolverConfirmacion) {
      this.resolverConfirmacion(respuesta); 
      this.resolverConfirmacion = null;
    }
  }
}