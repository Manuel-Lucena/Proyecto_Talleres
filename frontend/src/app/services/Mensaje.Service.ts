import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { MensajeRequest, MensajeResponse } from '../interfaces/Mensaje.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de la mensajería interna y el muro de los talleres.
 * Facilita la comunicación entre alumnos y profesores dentro del contexto de un taller.
 */
@Injectable({ providedIn: 'root' })
export class MensajeService {
  /** URL base para los endpoints de la API de mensajes */
  private apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient) { }

  /**
     * Obtiene el historial de mensajes publicados en el muro de un taller específico.
     * * @param idTaller Identificador del taller.
     * @returns Observable con la lista de mensajes.
     */
  listarPorTaller(idTaller: number): Observable<ApiResponse<MensajeResponse[]>> {
    return this.http.get<ApiResponse<MensajeResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
   * Publica un nuevo mensaje en el muro del taller.
   * @param mensaje Objeto con el contenido del mensaje y el ID del taller/usuario.
   * @returns Observable con el mensaje recién creado.
   */
  enviar(mensaje: MensajeRequest): Observable<ApiResponse<MensajeResponse>> {
    return this.http.post<ApiResponse<MensajeResponse>>(this.apiUrl, mensaje);
  }

  /**
   * Elimina un mensaje del muro.
   * @param id Identificador único del mensaje a borrar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}