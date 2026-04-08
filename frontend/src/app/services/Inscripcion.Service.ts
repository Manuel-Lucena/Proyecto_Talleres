import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { InscripcionRequest, InscripcionResponse } from '../interfaces/Inscripcion.Interface';

/**
 * Servicio encargado de gestionar las matriculaciones de alumnos en los talleres.
 * Permite el control administrativo de quién participa en cada actividad formativa.
 */
@Injectable({ providedIn: 'root' })
export class InscripcionService {
  /** URL base para los endpoints de la API de inscripciones */
  private apiUrl = 'http://localhost:8080/api/inscripciones';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el listado global de todas las inscripciones del sistema.
   * @returns Observable con la colección de inscripciones (InscripcionResponse).
   */
  listar(): Observable<ApiResponse<InscripcionResponse[]>> {
    return this.http.get<ApiResponse<InscripcionResponse[]>>(this.apiUrl);
  }

  /**
   * Obtiene las inscripciones de un taller específico (Lista de clase).
   * @param idTaller Identificador del taller.
   * @returns Observable con los alumnos inscritos en ese taller.
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<InscripcionResponse[]>> {
    return this.http.get<ApiResponse<InscripcionResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
   * Obtiene todos los talleres en los que está inscrito un usuario (Expediente del alumno).
   * @param idUsuario Identificador del usuario.
   * @returns Observable con los talleres asociados a ese usuario.
   */
  listarPorUsuario(idUsuario: number): Observable<ApiResponse<InscripcionResponse[]>> {
    return this.http.get<ApiResponse<InscripcionResponse[]>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  /**
   * Registra una nueva inscripción vinculando a un usuario con un taller.
   * @param datos Objeto con los IDs del usuario, taller y datos del pago.
   * @returns Observable con la inscripción confirmada.
   */
  inscribir(datos: InscripcionRequest): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.post<ApiResponse<InscripcionResponse>>(this.apiUrl, datos);
  }

  /**
   * Actualiza los datos de una inscripción existente (ej: cambio de estado o fecha).
   * @param id Identificador único de la inscripción.
   * @param datos Objeto con los nuevos datos de la inscripción.
   * @returns Observable con la inscripción actualizada.
   */
  actualizar(id: number, datos: InscripcionRequest): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.put<ApiResponse<InscripcionResponse>>(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * Cambia el estado de activación de una inscripción (Pausar/Reactivar).
   * @param id Identificador de la inscripción.
   * @returns Observable con la inscripción modificada.
   */
  cambiarEstado(id: number): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.put<ApiResponse<InscripcionResponse>>(`${this.apiUrl}/${id}/estado`, {});
  }

  /**
   * Elimina o cancela una inscripción en el sistema de forma permanente.
   * @param id Identificador de la inscripción a eliminar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  } 
}