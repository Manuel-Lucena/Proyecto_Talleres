import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private apiUrl = 'http://localhost:8080/api/descargas';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el flujo de datos del archivo desde el backend protegido.
   * Usamos 'blob' porque el backend envía un chorro de bytes, no un JSON.
   */
  obtenerBlob(tipo: 'material' | 'tarea' | 'entrega', id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${tipo}/${id}`, {
      responseType: 'blob'
    });
  }
}