import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface'; 
import { ArchivoMaterialResponse } from '../interfaces/Archivo.Interface'; // Interfaz unificada

@Injectable({
  providedIn: 'root'
})
export class ArchivoMaterialService {

  private readonly URL = 'http://localhost:8080/api/archivos-material';

  constructor(private http: HttpClient) { }

  // 1. POST - Guardar nuevo archivo de material
  guardar(idMaterial: number, archivo: File): Observable<ApiResponse<ArchivoMaterialResponse>> {
    const formData = new FormData();
    const dto = { idMaterial: idMaterial };

    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoMaterialResponse>>(this.URL, formData);
  }

  // 2. GET - Listar por Material
  listarPorMaterial(idMaterial: number): Observable<ApiResponse<ArchivoMaterialResponse[]>> {
    return this.http.get<ApiResponse<ArchivoMaterialResponse[]>>(`${this.URL}/material/${idMaterial}`);
  }

  // 3. DELETE - Borrar el archivo
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}