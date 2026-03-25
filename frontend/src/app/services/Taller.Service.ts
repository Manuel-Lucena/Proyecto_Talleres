import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { TallerResponse } from '../interfaces/Taller.Interface';

@Injectable({ providedIn: 'root' })
export class TallerService {
  private apiUrl = 'http://localhost:8080/api/talleres';

  constructor(private http: HttpClient) { }

  // 1. CREAR TALLER
  crear(formData: FormData): Observable<ApiResponse<TallerResponse>> {
    return this.http.post<ApiResponse<TallerResponse>>(this.apiUrl, formData);
  }

  // 2. LISTAR TODOS
  listarTodos(): Observable<ApiResponse<TallerResponse[]>> {
    return this.http.get<ApiResponse<TallerResponse[]>>(this.apiUrl);
  }

  // 3. OBTENER POR ID
  obtenerPorId(id: number): Observable<ApiResponse<TallerResponse>> {
    return this.http.get<ApiResponse<TallerResponse>>(`${this.apiUrl}/${id}`);
  }

  listarPorUsuario(idUsuario: number): Observable<ApiResponse<TallerResponse[]>> {
    return this.http.get<ApiResponse<TallerResponse[]>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  // 4. ACTUALIZAR TALLER
  // Recibe ID y FormData para permitir la actualización de la imagen

  actualizar(id: number, formData: FormData): Observable<ApiResponse<TallerResponse>> {
    return this.http.put<ApiResponse<TallerResponse>>(`${this.apiUrl}/${id.toString()}`, formData);
  }

  // 5. ELIMINAR (Borrado lógico configurado en el Backend)
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}