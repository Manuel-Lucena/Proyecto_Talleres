import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { ArchivoMaterialResponse } from '../interfaces/Archivo.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de la gestión de archivos adjuntos a los materiales didácticos.
 * Permite subir y organizar recursos teóricos para los talleres.
 */
@Injectable({
  providedIn: 'root'
})
export class ArchivoMaterialService {

  /** URL base para los endpoints de la API de archivos de material */
  private URL = `${environment.apiUrl}/archivos-material`;

  constructor(private http: HttpClient) { }

  /**
   * Sube un archivo físico y lo vincula a un recurso de material.
   * @param idMaterial ID del material de apoyo asociado.
   * @param archivo El fichero binario que se desea subir.
   * @returns Observable con la respuesta de la API y los metadatos del archivo guardado.
   */
  guardar(idMaterial: number, archivo: File): Observable<ApiResponse<ArchivoMaterialResponse>> {
    const formData = new FormData();
    const dto = { idMaterial: idMaterial };

    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoMaterialResponse>>(this.URL, formData);
  }

  /**
   * Recupera el listado de archivos vinculados a un material específico.
   * @param idMaterial Identificador del material de apoyo.
   * @returns Observable con la lista de archivos asociados.
   */
  listarPorMaterial(idMaterial: number): Observable<ApiResponse<ArchivoMaterialResponse[]>> {
    return this.http.get<ApiResponse<ArchivoMaterialResponse[]>>(`${this.URL}/material/${idMaterial}`);
  }

  /**
   * Elimina un archivo de material del sistema (base de datos y almacenamiento).
   * @param id Identificador único del archivo a borrar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}