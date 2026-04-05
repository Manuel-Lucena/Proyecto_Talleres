// Define esto en: src/app/models/archivo.interface.ts

export interface Archivo {
    id: number;
    nombre: string;
    rutaArchivo: string;
    extension: string;
}


export interface ArchivoTareaResponse extends Archivo { idTarea: number; }
export interface ArchivoMaterialResponse extends Archivo { idMaterial: number; }
export interface ArchivoEntregaResponse extends Archivo { idEntrega: number; }



export interface ArchivoTareaRequest { idTarea: number; }
export interface ArchivoMaterialRequest { idMaterial: number; }
export interface ArchivoEntregaRequest { idEntrega: number; }