import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { ArchivoEntregaResponse } from '../interfaces/Archivo.Interface'; // Interfaz unificada

@Injectable({
  providedIn: 'root'
})
export class ArchivoEntregaService {

  private readonly URL = 'http://localhost:8080/api/archivos-entrega';

  constructor(private http: HttpClient) { }

  // 1. POST - Guardar el archivo que el alumno sube
  guardar(idEntrega: number, archivo: File): Observable<ApiResponse<ArchivoEntregaResponse>> {
    const formData = new FormData();
    const dto = { idEntrega: idEntrega };

    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoEntregaResponse>>(this.URL, formData);
  }

  // 2. GET - Listar archivos de una entrega
  listarPorEntrega(idEntrega: number): Observable<ApiResponse<ArchivoEntregaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoEntregaResponse[]>>(`${this.URL}/entrega/${idEntrega}`);
  }

  // 3. DELETE - Eliminar archivo
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}