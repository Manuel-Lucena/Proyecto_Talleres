import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { TareaRequest, TareaResponse } from '../interfaces/Tarea.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio para la gestión de tareas académicas dentro de los talleres.
 * Permite realizar operaciones CRUD comunicándose con el endpoint de tareas en el backend.
 */
@Injectable({ providedIn: 'root' })
export class TareaService {
  /** URL base para los endpoints de la API de tareas */
  private apiUrl = `${environment.apiUrl}/tareas`;

  constructor(private http: HttpClient) { }

  /**
   * Recupera todas las tareas asociadas a un taller específico.
   * @param idTaller Identificador del taller del cual se quieren obtener las tareas.
   * @returns Observable con una lista de objetos TareaResponse.
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<TareaResponse[]>> {
    return this.http.get<ApiResponse<TareaResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
     * [ALUMNO] Recupera las tareas visibles y asignadas según el nivel del alumno.
     * @param idTaller Identificador del taller.
     * @returns Observable con la lista de tareas permitidas.
     */
  listarVisibles(idTaller: number): Observable<ApiResponse<TareaResponse[]>> {
    return this.http.get<ApiResponse<TareaResponse[]>>(`${this.apiUrl}/taller/${idTaller}/visibles`);
  }

  /**
     * Obtiene la información detallada de una tarea específica por su ID.
     * @param id Identificador único de la tarea.
     * @returns Observable con los datos de la tarea solicitada.
     */
  obtenerPorId(id: number): Observable<ApiResponse<TareaResponse>> {
    return this.http.get<ApiResponse<TareaResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva tarea en el sistema.
   * @param tarea Objeto de tipo TareaRequest con la información de la nueva tarea.
   * @returns Observable con la tarea creada y confirmación de la API.
   */
  crear(tarea: TareaRequest): Observable<ApiResponse<TareaResponse>> {
    return this.http.post<ApiResponse<TareaResponse>>(this.apiUrl, tarea);
  }

  /**
   * Actualiza los datos de una tarea existente.
   * @param id Identificador de la tarea a modificar.
   * @param tarea Objeto con los nuevos datos actualizados.
   * @returns Observable con la respuesta de la tarea modificada.
   */
  actualizar(id: number, tarea: TareaRequest): Observable<ApiResponse<TareaResponse>> {
    return this.http.put<ApiResponse<TareaResponse>>(`${this.apiUrl}/${id}`, tarea);
  }


  /**
 * Cambia el estado de visibilidad de una tarea (público/privado).
 * @param id Identificador de la tarea.
 * @returns Observable con la tarea actualizada.
 */
  cambiarVisibilidad(id: number): Observable<ApiResponse<TareaResponse>> {
    return this.http.put<ApiResponse<TareaResponse>>(`${this.apiUrl}/${id}/visibilidad`, {});
  }

  /**
   * Elimina una tarea de forma permanente del sistema.
   * @param id Identificador de la tarea a eliminar.
   * @returns Observable de tipo void indicando el éxito de la operación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}