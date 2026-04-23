import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio especializado en la descarga de archivos binarios desde el servidor.
 * Interactúa con el controlador de descargas que maneja el flujo de bytes (stream).
 */
@Injectable({ providedIn: 'root' })
export class ArchivoService {
  /** URL base para el controlador de descargas y visualización de archivos */
  private apiUrl = `${environment.apiUrl}/descargas`;

  constructor(private http: HttpClient) { }

  /**
   * Solicita al backend el flujo de datos (Blob) de un archivo específico.
   * Es compatible con archivos de materiales, tareas y entregas de alumnos.
   * * @param tipo El contexto del archivo ('material', 'tarea' o 'entrega').
   * @param id El identificador único del archivo en su respectiva tabla.
   * @returns Observable de tipo Blob (Binary Large Object) para su posterior descarga o visualización.
   */
  obtenerBlob(tipo: 'material' | 'tarea' | 'entrega', id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${tipo}/${id}`, {
      responseType: 'blob'
    });
  }
}