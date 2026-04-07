/**
 * Datos para la creación de un nuevo material didáctico.
 */
export interface MaterialRequest {
    titulo: string;
    contenido: string;
    idTaller: number;
    visible: boolean;
}

/**
 * Información del material educativo con metadatos del sistema.
 */
export interface MaterialResponse {
    id: number;
    titulo: string;
    contenido: string;
    fechaSubida: string;
    idTaller: number;
    visible: boolean;
}