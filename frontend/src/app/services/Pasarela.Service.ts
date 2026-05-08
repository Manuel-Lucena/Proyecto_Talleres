import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { InscripcionResponse } from '../interfaces/Inscripcion.Interface';
import { environment } from '../../environments/environment';

/**
 * SERVICIO DE PASARELA: Gestiona el proceso de pago simulado del sistema.
 * Actúa como un intermediario seguro que valida las transacciones económicas
 * antes de confirmar formalmente la matrícula de un alumno en un taller.
 */
@Injectable({
  providedIn: 'root'
})
export class PasarelaService {

  /** URL base para los endpoints de la pasarela de pago */
  private apiUrl = `${environment.apiUrl}/pasarela`;

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos de pago y la información de inscripción para su procesamiento.
   * * @param datosPago Objeto que contiene la información bancaria (titular, tarjeta, CVV) 
   * y el bloque de información de la inscripción (idUsuario, idTaller).
   * @returns Observable con la respuesta de la API e información de la inscripción confirmada.
   */
  procesarPago(datosPago: any): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.post<ApiResponse<InscripcionResponse>>(`${this.apiUrl}/procesar`, datosPago);
  }
}