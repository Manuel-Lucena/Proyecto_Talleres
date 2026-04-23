import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { NoticiaResponse } from '../interfaces/Noticia.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio para la gestión del tablón de noticias y comunicaciones globales.
 * Permite a los administradores publicar contenido informativo con soporte para imágenes.
 */
@Injectable({ providedIn: 'root' })
export class NoticiaService {
  /** URL base para los endpoints de la API de noticias */
  private apiUrl = `${environment.apiUrl}/noticias`;

  constructor(private http: HttpClient) {}

  /**
   * Recupera el listado de todas las noticias publicadas, ordenadas por fecha de creación.
   * @returns Observable con un array de NoticiaResponse.
   */
  listar(): Observable<ApiResponse<NoticiaResponse[]>> {
    return this.http.get<ApiResponse<NoticiaResponse[]>>(this.apiUrl);
  }

  /**
   * Obtiene el contenido detallado de una noticia específica.
   * @param id Identificador único de la noticia.
   * @returns Observable con los datos de la noticia.
   */
  obtenerPorId(id: number): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.get<ApiResponse<NoticiaResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva noticia en el sistema incluyendo metadatos e imagen.
   * @param formData Objeto FormData que empaqueta el JSON de la noticia y el archivo de imagen.
   * @returns Observable con la noticia creada.
   */
  crear(formData: FormData): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.post<ApiResponse<NoticiaResponse>>(this.apiUrl, formData);
  }

  /**
   * Actualiza una noticia existente permitiendo modificar su contenido o imagen de cabecera.
   * @param id Identificador de la noticia a modificar.
   * @param formData Nuevos datos de la noticia en formato multipart/form-data.
   * @returns Observable con la noticia actualizada.
   */
  actualizar(id: number, formData: FormData): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.put<ApiResponse<NoticiaResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina una noticia de forma permanente del sistema.
   * @param id Identificador de la noticia a eliminar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}