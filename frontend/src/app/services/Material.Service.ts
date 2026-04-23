import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { MaterialRequest, MaterialResponse } from '../interfaces/Material.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio para la gestión de materiales didácticos y recursos de apoyo.
 * Permite a los profesores organizar el contenido teórico de sus talleres.
 */
@Injectable({ providedIn: 'root' })
export class MaterialService {
  /** URL base para los endpoints de la API de materiales */
  private apiUrl = `${environment.apiUrl}/materiales`;

  constructor(private http: HttpClient) { }

  /**
   * Lista todos los materiales y recursos asociados a un taller.
   * @param idTaller ID del taller seleccionado.
   * @returns Observable con la colección de materiales didácticos.
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<MaterialResponse[]>> {
    return this.http.get<ApiResponse<MaterialResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
     * Lista solo los materiales que el profesor ha decidido publicar.
     * @param idTaller ID del taller seleccionado.
     * @returns Observable con la colección de materiales visibles.
     */
  listarVisibles(idTaller: number): Observable<ApiResponse<MaterialResponse[]>> {
    return this.http.get<ApiResponse<MaterialResponse[]>>(`${this.apiUrl}/taller/${idTaller}/visibles`);
  }

  /**
     * Recupera la información detallada de un material educativo por su ID.
     * @param id Identificador del material.
     * @returns Observable con los detalles del material.
     */
  obtenerPorId(id: number): Observable<ApiResponse<MaterialResponse>> {
    return this.http.get<ApiResponse<MaterialResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registra un nuevo recurso o material didáctico.
   * @param material Datos del material (título, contenido, etc.).
   * @returns Observable con el material creado.
   */
  crear(material: MaterialRequest): Observable<ApiResponse<MaterialResponse>> {
    return this.http.post<ApiResponse<MaterialResponse>>(this.apiUrl, material);
  }

  /**
   * Actualiza el contenido o título de un material existente.
   * @param id ID del material a modificar.
   * @param material Objeto con los nuevos datos.
   * @returns Observable con la respuesta de actualización.
   */
  actualizar(id: number, material: MaterialRequest): Observable<ApiResponse<MaterialResponse>> {
    return this.http.put<ApiResponse<MaterialResponse>>(`${this.apiUrl}/${id}`, material);
  }

  /**
 * Alterna la visibilidad de un material didáctico.
 * @param id Identificador del material.
 * @returns Observable con el material actualizado.
 */
  cambiarVisibilidad(id: number): Observable<ApiResponse<MaterialResponse>> {
    return this.http.put<ApiResponse<MaterialResponse>>(`${this.apiUrl}/${id}/visibilidad`, {});
  }

  /**
   * Elimina un material del taller.
   * @param id Identificador del material a eliminar.
   * @returns Observable indicando el resultado de la operación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}