/**
 * Modelo base para la gestión de ficheros en el sistema.
 */
export interface Archivo {
    id: number;
    nombre: string;
    rutaArchivo: string;
    extension: string;
}

// --- Respuestas del Servidor (Response) ---

export interface ArchivoTareaResponse extends Archivo { idTarea: number; }
export interface ArchivoMaterialResponse extends Archivo { idMaterial: number; }
export interface ArchivoEntregaResponse extends Archivo { idEntrega: number; }

// --- Objetos de Petición (Request/DTO) ---

export interface ArchivoTareaRequest { idTarea: number; }
export interface ArchivoMaterialRequest { idMaterial: number; }
export interface ArchivoEntregaRequest { idEntrega: number; }