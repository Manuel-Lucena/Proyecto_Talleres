import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { ArchivoEntregaResponse } from '../interfaces/Archivo.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de gestionar los archivos que los alumnos adjuntan en sus entregas.
 * Crucial para la recepción de trabajos prácticos y exámenes.
 */
@Injectable({
  providedIn: 'root'
})
export class ArchivoEntregaService {

  /** URL base para los endpoints de la API de archivos de entrega */
  private URL = `${environment.apiUrl}/archivos-entrega`;

  constructor(private http: HttpClient) { }

  /**
   * Guarda un archivo físico subido por el alumno para una entrega determinada.
   * @param idEntrega ID del registro de entrega al que pertenece el archivo.
   * @param archivo Fichero binario (PDF, DOCX, ZIP, etc.).
   * @returns Observable con la respuesta del servidor.
   */
  guardar(idEntrega: number, archivo: File): Observable<ApiResponse<ArchivoEntregaResponse>> {
    const formData = new FormData();
    const dto = { idEntrega: idEntrega };

    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoEntregaResponse>>(this.URL, formData);
  }

  /**
   * Obtiene todos los archivos enviados por el alumno en una entrega específica.
   * @param idEntrega Identificador de la entrega.
   * @returns Observable con la colección de archivos adjuntos.
   */
  listarPorEntrega(idEntrega: number): Observable<ApiResponse<ArchivoEntregaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoEntregaResponse[]>>(`${this.URL}/entrega/${idEntrega}`);
  }

  /**
   * Elimina un archivo enviado en una entrega (permitido antes de la calificación).
   * @param id ID del archivo a eliminar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}