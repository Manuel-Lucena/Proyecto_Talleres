/**
 * Datos necesarios para procesar una nueva inscripción y su pago.
 */
export interface InscripcionRequest {
    idUsuario: number;
    idTaller: number;
    montoPagado: number;
    orderId: string;
}

/**
 * Información completa de la matrícula y el estado del pago.
 */
export interface InscripcionResponse {
    idInscripcion: number;
    idUsuario: number;
    idTaller: number;
    fechaInscripcion: string; 
    fechaPago?: string;
    montoPagado: number;
    estadoPago: string; 
    orderId: string;
    activa: boolean;
    nombreTaller?: string;
    emailUsuario?: string;
}