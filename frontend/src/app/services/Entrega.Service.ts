import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { EntregaRequest, EntregaResponse } from '../interfaces/Entrega.Interface';

@Injectable({ providedIn: 'root' })
export class EntregaService {
    private apiUrl = 'http://localhost:8080/api/entregas';

    constructor(private http: HttpClient) { }

    listarTodas(): Observable<ApiResponse<EntregaResponse[]>> {
        return this.http.get<ApiResponse<EntregaResponse[]>>(this.apiUrl);
    }

    buscarPorId(id: number): Observable<ApiResponse<EntregaResponse>> {
        return this.http.get<ApiResponse<EntregaResponse>>(`${this.apiUrl}/${id}`);
    }

    listarPorTarea(idTarea: number): Observable<ApiResponse<EntregaResponse[]>> {
        return this.http.get<ApiResponse<EntregaResponse[]>>(`${this.apiUrl}/tarea/${idTarea}`);
    }

    enviar(entrega: EntregaRequest): Observable<ApiResponse<EntregaResponse>> {
        return this.http.post<ApiResponse<EntregaResponse>>(this.apiUrl, entrega);
    }

    calificar(id: number, entrega: EntregaRequest): Observable<ApiResponse<EntregaResponse>> {
        return this.http.put<ApiResponse<EntregaResponse>>(`${this.apiUrl}/${id}/calificar`, entrega);
    }

    eliminar(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
    }

    actualizar(idEntrega: number, datos: { textoEntrega: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/${idEntrega}`, datos);
    }
}