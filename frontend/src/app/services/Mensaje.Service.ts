import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { MensajeRequest, MensajeResponse } from '../interfaces/Mensaje.Interface';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private apiUrl = 'http://localhost:8080/api/mensajes';

  constructor(private http: HttpClient) {}

  listarPorTaller(idTaller: number): Observable<ApiResponse<MensajeResponse[]>> {
    return this.http.get<ApiResponse<MensajeResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  enviar(mensaje: MensajeRequest): Observable<ApiResponse<MensajeResponse>> {
    return this.http.post<ApiResponse<MensajeResponse>>(this.apiUrl, mensaje);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}