import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse.Interface';
import { NoticiaResponse } from '../models/Noticia.Interface';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private apiUrl = 'http://localhost:8080/api/noticias';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de noticias
   */
  listar(): Observable<ApiResponse<NoticiaResponse[]>> {
    return this.http.get<ApiResponse<NoticiaResponse[]>>(this.apiUrl);
  }

  /**
   * Obtiene una noticia específica por su ID
   */
  obtenerPorId(id: number): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.get<ApiResponse<NoticiaResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva noticia enviando un FormData (JSON + Imagen)
   */
  crear(formData: FormData): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.post<ApiResponse<NoticiaResponse>>(this.apiUrl, formData);
  }

  /**
   * Actualiza una noticia existente.
   * Recibe el ID y el FormData empaquetado desde el componente.
   */
  actualizar(id: number, formData: FormData): Observable<ApiResponse<NoticiaResponse>> {
    return this.http.put<ApiResponse<NoticiaResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina una noticia del sistema
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}