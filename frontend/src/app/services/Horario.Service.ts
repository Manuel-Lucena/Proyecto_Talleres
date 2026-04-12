import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { HorarioRequest, HorarioResponse } from '../interfaces/Horario.Interface';

/**
 * Servicio para la gestión de la disponibilidad temporal de los talleres.
 * Administra los días, horas de inicio y fin para cada sesión formativa.
 */
@Injectable({ providedIn: 'root' })
export class HorarioService {

  private apiUrl = 'http://localhost:8080/api/horarios';

  constructor(private http: HttpClient) { }

  /**
   * Recupera todos los horarios configurados en la plataforma.
   * @returns Observable con la lista global de horarios.
   */
  listar(): Observable<ApiResponse<HorarioResponse[]>> {
    return this.http.get<ApiResponse<HorarioResponse[]>>(this.apiUrl);
  }

    /**
   * Recupera todos los horarios del usuario.
   * @returns Observable con la lista de los horarios del usuario.
   */
  listarPorUsuario(idUsuario: number | null): Observable<ApiResponse<HorarioResponse[]>> {
    return this.http.get<ApiResponse<HorarioResponse[]>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  /**
   * Obtiene la planificación horaria específica de un taller concreto.
   * Este método es fundamental para mostrar la agenda en el modal de detalles del taller.
   * @param idTaller Identificador del taller a consultar.
   * @returns Observable con los horarios asociados a dicho taller.
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<HorarioResponse[]>> {
    return this.http.get<ApiResponse<HorarioResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
   * Crea una nueva franja horaria para un taller.
   * @param dto Objeto HorarioRequest con el día de la semana y las horas de sesión.
   * @returns Observable con el horario registrado.
   */
  crear(dto: HorarioRequest): Observable<ApiResponse<HorarioResponse>> {
    return this.http.post<ApiResponse<HorarioResponse>>(this.apiUrl, dto);
  }

  /**
   * Modifica una sesión horaria existente.
   * @param id Identificador del horario a actualizar.
   * @param dto Nuevos datos de programación horaria.
   * @returns Observable con el horario modificado.
   */
  actualizar(id: number, dto: HorarioRequest): Observable<ApiResponse<HorarioResponse>> {
    return this.http.put<ApiResponse<HorarioResponse>>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Elimina un registro de horario del sistema.
   * @param id Identificador del horario a borrar.
   * @returns Observable indicando el éxito de la operación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}