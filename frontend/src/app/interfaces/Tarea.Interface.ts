/**
 * Datos requeridos para crear una nueva actividad evaluable.
 */
export interface TareaRequest {
    titulo: string;
    descripcion: string;
    idTaller: number;
    fechaEntrega: Date | string;
    visible: boolean; 
    extensionesPermitidas?: string; 
    alumnosIds?: number[];
}

/**
 * Información detallada de la tarea devuelta por el servidor.
 */
export interface TareaResponse {
    idTarea: number;
    titulo: string;
    descripcion: string;
    fechaPublicacion: Date | string;
    fechaEntrega: Date | string;
    estado: string;
    idTaller: number;
    nombreTaller: string;
    visible: boolean; 
    extensionesPermitidas: string; 
    alumnosAsignadosIds: number[];
}