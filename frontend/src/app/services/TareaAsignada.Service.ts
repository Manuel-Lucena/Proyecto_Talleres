import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { TareaAsignadaResponse } from '../interfaces/TareaAsignada.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio para la gestión de visibilidad selectiva de tareas por alumno.
 * Permite al profesorado asignar actividades de forma individual en lugar de a todo el taller.
 */
@Injectable({ providedIn: 'root' })
export class TareaAsignadaService {
  private apiUrl = `${environment.apiUrl}/tareas-asignadas`;

  constructor(private http: HttpClient) { }

  /**
   * Recupera el listado de alumnos que tienen acceso a una tarea específica.
   * @param idTarea Identificador único de la tarea.
   * @returns Observable con la lista de asignaciones actuales.
   */
  listarPorTarea(idTarea: number): Observable<ApiResponse<TareaAsignadaResponse[]>> {
    return this.http.get<ApiResponse<TareaAsignadaResponse[]>>(`${this.apiUrl}/tarea/${idTarea}`);
  }

  /**
   * Recupera la colección de tareas que han sido asignadas a un alumno concreto.
   * @param idAlumno Identificador único del estudiante.
   * @returns Observable con el listado de asignaciones del alumno.
   */
  listarPorAlumno(idAlumno: number): Observable<ApiResponse<TareaAsignadaResponse[]>> {
    return this.http.get<ApiResponse<TareaAsignadaResponse[]>>(`${this.apiUrl}/alumno/${idAlumno}`);
  }

  /**
   * Sincroniza la lista de alumnos asignados a una tarea.
   * Este método reemplaza las asignaciones anteriores por la nueva lista de IDs.
   * @param idTarea Identificador de la tarea a modificar.
   * @param alumnosIds Array con los identificadores de los alumnos seleccionados.
   * @returns Observable indicando el éxito de la operación.
   */
  actualizarAsignaciones(idTarea: number, alumnosIds: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/actualizar/${idTarea}`, alumnosIds);
  }

  /**
   * Elimina todas las restricciones de visibilidad de una tarea.
   * @param idTarea Identificador de la tarea.
   * @returns Observable de confirmación.
   */
  eliminarAsignacionesDeTarea(idTarea: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/tarea/${idTarea}`);
  }
}