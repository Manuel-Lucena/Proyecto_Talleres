import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { EntregaRequest, EntregaResponse } from '../interfaces/Entrega.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de gestionar las entregas de tareas por parte de los alumnos.
 * Facilita tanto el envío de trabajos como el proceso de calificación por parte del docente.
 */
@Injectable({ providedIn: 'root' })
export class EntregaService {

    private apiUrl = `${environment.apiUrl}/entregas`;

    constructor(private http: HttpClient) { }

    /**
     * Recupera todas las entregas registradas en el sistema (Uso administrativo).
     * @returns Observable con la lista global de entregas.
     */
    listarTodas(): Observable<ApiResponse<EntregaResponse[]>> {
        return this.http.get<ApiResponse<EntregaResponse[]>>(this.apiUrl);
    }

    /**
       * Busca una entrega específica mediante su identificador único.
       * @param id ID de la entrega.
       * @returns Observable con la información detallada de la entrega.
       */
    buscarPorId(id: number): Observable<ApiResponse<EntregaResponse>> {
        return this.http.get<ApiResponse<EntregaResponse>>(`${this.apiUrl}/${id}`);
    }

    /**
       * Obtiene todas las entregas realizadas para una tarea concreta.
       * @param idTarea Identificador de la tarea.
       * @returns Observable con el listado de entregas de los alumnos para esa tarea.
       */
    listarPorTarea(idTarea: number): Observable<ApiResponse<EntregaResponse[]>> {
        return this.http.get<ApiResponse<EntregaResponse[]>>(`${this.apiUrl}/tarea/${idTarea}`);
    }

    /**
   * Recupera el expediente completo de entregas de un alumno para un taller específico.
   * Permite al docente visualizar el progreso individual del estudiante en todas las actividades.
   * * @param idAlumno ID del estudiante a consultar.
   * @param idTaller ID del taller actual.
   * @returns Observable con las entregas realizadas por el alumno en el taller.
   */
    listarPorAlumnoYTaller(idAlumno: number, idTaller: number): Observable<ApiResponse<EntregaResponse[]>> {
        return this.http.get<ApiResponse<EntregaResponse[]>>(`${this.apiUrl}/alumno/${idAlumno}/taller/${idTaller}`);
    }


    /**
      * Recupera la entrega realizada por el usuario autenticado para una tarea específica.
      * * @param idTarea ID de la tarea a consultar.
      * @returns Observable con la entrega del alumno actual.
      */
    obtenerMiEntrega(idTarea: number): Observable<ApiResponse<EntregaResponse>> {
        return this.http.get<ApiResponse<EntregaResponse>>(`${this.apiUrl}/tarea/${idTarea}/mi-entrega`);
    }

    /**
     * Registra el envío inicial de una tarea por parte del alumno.
     * @param entrega Objeto con los datos de la entrega (idUsuario, idTarea, texto).
     * @returns Observable con la entrega creada.
     */
    enviar(entrega: EntregaRequest): Observable<ApiResponse<EntregaResponse>> {
        return this.http.post<ApiResponse<EntregaResponse>>(this.apiUrl, entrega);
    }

    /**
     * Permite al profesor asignar una nota y feedback a una entrega específica.
     * @param id ID de la entrega a calificar.
     * @param entrega Objeto que contiene la calificación y observaciones.
     * @returns Observable con la entrega calificada.
     */
    calificar(id: number, entrega: EntregaRequest): Observable<ApiResponse<EntregaResponse>> {
        return this.http.put<ApiResponse<EntregaResponse>>(`${this.apiUrl}/${id}/calificar`, entrega);
    }

    /**
     * Elimina una entrega del sistema.
     * @param id Identificador de la entrega a borrar.
     * @returns Observable de confirmación.
     */
    eliminar(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Actualiza el contenido textual de una entrega ya realizada.
     * @param idEntrega ID de la entrega.
     * @param datos Objeto con el nuevo texto de la entrega.
     * @returns Observable con la respuesta del servidor.
     */
    actualizar(idEntrega: number, datos: { textoEntrega: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/${idEntrega}`, datos);
    }
}