import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { TallerResponse } from '../interfaces/Taller.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de la gestión de los talleres o cursos del sistema.
 * Centraliza las peticiones HTTP para el ciclo de vida de un taller,
 * incluyendo la gestión de archivos multimedia (portadas) mediante FormData.
 */
@Injectable({ providedIn: 'root' })
export class TallerService {
  private apiUrl = `${environment.apiUrl}/talleres`;

  constructor(private http: HttpClient) { }

  /**
   * Registra un nuevo taller en la base de datos.
   * @param formData Objeto FormData que contiene los campos del taller y la imagen de portada.
   * @returns Observable con la respuesta de la API y el taller creado.
   */
  crear(formData: FormData): Observable<ApiResponse<TallerResponse>> {
    return this.http.post<ApiResponse<TallerResponse>>(this.apiUrl, formData);
  }

  /**
   * Recupera la lista completa de todos los talleres registrados en el sistema.
   * @returns Observable con un array de objetos TallerResponse.
   */
  listarTodos(): Observable<ApiResponse<TallerResponse[]>> {
    return this.http.get<ApiResponse<TallerResponse[]>>(this.apiUrl);
  }

  /**
   * Busca y obtiene la información detallada de un taller por su identificador.
   * @param id ID único del taller.
   * @returns Observable con los datos del taller solicitado.
   */
  obtenerPorId(id: number): Observable<ApiResponse<TallerResponse>> {
    return this.http.get<ApiResponse<TallerResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene la lista de talleres en los que un usuario específico está inscrito o es profesor.
   * @param idUsuario Identificador único del usuario.
   * @returns Observable con la lista de talleres relacionados al usuario.
   */
  listarPorUsuario(idUsuario: number): Observable<ApiResponse<TallerResponse[]>> {
    return this.http.get<ApiResponse<TallerResponse[]>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  /**
   * Obtiene la lista de talleres que un profesor imparte como titular.
   * @param idProfesor Identificador único del profesor.
   * @returns Observable con la lista de talleres asignados al docente.
   */
  listarPorProfesor(idProfesor: number): Observable<ApiResponse<TallerResponse[]>> {
    return this.http.get<ApiResponse<TallerResponse[]>>(`${this.apiUrl}/profesor/${idProfesor}`);
  }

  /**
   * Actualiza la información de un taller existente.
   * Permite modificar tanto datos textuales como la imagen de portada.
   * @param id Identificador del taller a actualizar.
   * @param formData Objeto FormData con los nuevos datos y/o imagen.
   * @returns Observable con el taller actualizado.
   */
  actualizar(id: number, formData: FormData): Observable<ApiResponse<TallerResponse>> {
    return this.http.put<ApiResponse<TallerResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina un taller del sistema. 
   * Nota: El backend está configurado para realizar un "Borrado Lógico" 
   * preservando la integridad referencial de los datos.
   * @param id ID del taller a eliminar.
   * @returns Observable de confirmación de la operación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}