import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { HorarioRequest, HorarioResponse } from '../interfaces/Horario.Interface';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private apiUrl = 'http://localhost:8080/api/horarios';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de horarios
   */
  listar(): Observable<ApiResponse<HorarioResponse[]>> {
    return this.http.get<ApiResponse<HorarioResponse[]>>(this.apiUrl);
  }

  /**
   * Obtiene los horarios específicos de un taller por su ID
   * (Crucial para el modal de Mis Talleres)
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<HorarioResponse[]>> {
    return this.http.get<ApiResponse<HorarioResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
   * Crea un nuevo horario para un taller enviando un JSON (HorarioRequestDTO)
   */
  crear(dto: HorarioRequest): Observable<ApiResponse<HorarioResponse>> {
    return this.http.post<ApiResponse<HorarioResponse>>(this.apiUrl, dto);
  }

  /**
   * Actualiza un horario existente.
   * Recibe el ID y el objeto DTO empaquetado.
   */
  actualizar(id: number, dto: HorarioRequest): Observable<ApiResponse<HorarioResponse>> {
    return this.http.put<ApiResponse<HorarioResponse>>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Elimina un horario del sistema
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}