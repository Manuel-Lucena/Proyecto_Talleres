/**
 * Información de la asignación de una tarea a un alumno específico.
 * Se utiliza para mapear quién tiene visibilidad sobre actividades selectivas.
 */
export interface TareaAsignadaResponse {
    idAsignacion: number;
    idTarea: number;
    idAlumno: number;
    nombreAlumno: string;
    apellidosAlumno: string;
}

/**
 * DTO para la creación o actualización masiva de asignaciones.
 */
export interface TareaAsignadaRequest {
    idTarea: number;
    alumnosIds: number[];
}