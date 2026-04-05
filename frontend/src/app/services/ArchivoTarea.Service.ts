import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface'; 
import { ArchivoTareaResponse } from '../interfaces/Archivo.Interface'; // Interfaz unificada

@Injectable({
  providedIn: 'root'
})
export class ArchivoTareaService {

  private readonly URL = 'http://localhost:8080/api/archivos-tarea';

  constructor(private http: HttpClient) { }

  // 1. GET - Listar todos
  listarTodos(): Observable<ApiResponse<ArchivoTareaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse[]>>(this.URL);
  }

  // 2. GET - Buscar por ID
  buscarPorId(id: number): Observable<ApiResponse<ArchivoTareaResponse>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse>>(`${this.URL}/${id}`);
  }

  // 3. GET - Listar por Tarea específica
  listarPorTarea(idTarea: number): Observable<ApiResponse<ArchivoTareaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse[]>>(`${this.URL}/tarea/${idTarea}`);
  }

  // 4. POST - Guardar nuevo archivo físico
  guardar(idTarea: number, archivo: File): Observable<ApiResponse<ArchivoTareaResponse>> {
    const formData = new FormData();
    const dto = { idTarea: idTarea };
    
    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoTareaResponse>>(this.URL, formData);
  }

  // 5. DELETE - Eliminar archivo
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}