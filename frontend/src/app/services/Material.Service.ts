import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { MaterialRequest, MaterialResponse } from '../interfaces/Material.Interface';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private apiUrl = 'http://localhost:8080/api/materiales';

  constructor(private http: HttpClient) { }

  listarPorTaller(idTaller: number): Observable<ApiResponse<MaterialResponse[]>> {
    return this.http.get<ApiResponse<MaterialResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<MaterialResponse>> {
    return this.http.get<ApiResponse<MaterialResponse>>(`${this.apiUrl}/${id}`);
  }

  crear(material: MaterialRequest): Observable<ApiResponse<MaterialResponse>> {
    return this.http.post<ApiResponse<MaterialResponse>>(this.apiUrl, material);
  }

  actualizar(id: number, material: MaterialRequest): Observable<ApiResponse<MaterialResponse>> {
    return this.http.put<ApiResponse<MaterialResponse>>(`${this.apiUrl}/${id}`, material);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}