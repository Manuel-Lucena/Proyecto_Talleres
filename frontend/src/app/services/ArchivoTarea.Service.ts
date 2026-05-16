import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { ArchivoTareaResponse } from '../interfaces/Archivo.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de la gestión de archivos físicos asociados a las tareas (enunciados).
 * Maneja la subida de ficheros al servidor y su vinculación con las entidades de tarea.
 */
@Injectable({
  providedIn: 'root'
})
export class ArchivoTareaService {

  /** URL base para los endpoints de la API de archivos de tarea */
  private URL = `${environment.apiUrl}/archivos-tarea`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene un listado de todos los archivos de tareas almacenados.
   * @returns Observable con la lista de metadatos de los archivos.
   */
  listarTodos(): Observable<ApiResponse<ArchivoTareaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse[]>>(this.URL);
  }

  /**
   * Obtiene la información de un archivo específico por su ID.
   * @param id ID del registro de archivo.
   * @returns Observable con los datos del archivo.
   */
  buscarPorId(id: number): Observable<ApiResponse<ArchivoTareaResponse>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse>>(`${this.URL}/${id}`);
  }

  /**
   * Recupera todos los archivos adjuntos a una tarea específica (ej: PDF de enunciados).
   * @param idTarea ID de la tarea asociada.
   * @returns Observable con la lista de archivos de dicha tarea.
   */
  listarPorTarea(idTarea: number): Observable<ApiResponse<ArchivoTareaResponse[]>> {
    return this.http.get<ApiResponse<ArchivoTareaResponse[]>>(`${this.URL}/tarea/${idTarea}`);
  }

  /**
   * Sube un archivo físico al servidor y lo vincula a una tarea.
   * Utiliza FormData para combinar un objeto JSON (Blob) y el archivo binario.
   * @param idTarea ID de la tarea a la que pertenece el archivo.
   * @param archivo El fichero seleccionado por el usuario.
   * @returns Observable con el registro del archivo creado.
   */
  guardar(idTarea: number, archivo: File): Observable<ApiResponse<ArchivoTareaResponse>> {
    const formData = new FormData();
    const dto = { idTarea: idTarea };

    formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('archivo', archivo);

    return this.http.post<ApiResponse<ArchivoTareaResponse>>(this.URL, formData);
  }

  /**
   * Elimina un archivo tanto de la base de datos como del almacenamiento físico.
   * @param id ID del archivo a eliminar.
   * @returns Observable de confirmación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/${id}`);
  }
}