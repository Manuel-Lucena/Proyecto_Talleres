import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { InscripcionRequest, InscripcionResponse } from '../interfaces/Inscripcion.Interface';
import { TallerResponse } from '../interfaces/Taller.Interface';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private apiUrl = 'http://localhost:8080/api/inscripciones';

  constructor(private http: HttpClient) { }

  listar(): Observable<ApiResponse<InscripcionResponse[]>> {
    return this.http.get<ApiResponse<InscripcionResponse[]>>(this.apiUrl);
  }

  inscribir(datos: InscripcionRequest): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.post<ApiResponse<InscripcionResponse>>(this.apiUrl, datos);
  }

  actualizar(id: number, datos: InscripcionRequest): Observable<ApiResponse<InscripcionResponse>> {
    return this.http.put<ApiResponse<InscripcionResponse>>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}