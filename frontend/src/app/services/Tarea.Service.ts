import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { TareaRequest, TareaResponse } from '../interfaces/Tarea.Interface';

@Injectable({ providedIn: 'root' })
export class TareaService {
  private apiUrl = 'http://localhost:8080/api/tareas';

  constructor(private http: HttpClient) { }

  listarPorTaller(idTaller: number): Observable<ApiResponse<TareaResponse[]>> {
    return this.http.get<ApiResponse<TareaResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<TareaResponse>> {
    return this.http.get<ApiResponse<TareaResponse>>(`${this.apiUrl}/${id}`);
  }

  crear(tarea: TareaRequest): Observable<ApiResponse<TareaResponse>> {
    return this.http.post<ApiResponse<TareaResponse>>(this.apiUrl, tarea);
  }

  actualizar(id: number, tarea: TareaRequest): Observable<ApiResponse<TareaResponse>> {
    return this.http.put<ApiResponse<TareaResponse>>(`${this.apiUrl}/${id}`, tarea);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}