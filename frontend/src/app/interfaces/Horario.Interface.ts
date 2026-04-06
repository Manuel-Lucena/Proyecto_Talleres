/**
 * Datos requeridos para programar una sesión horaria.
 */
export interface HorarioRequest {
    idTaller: number;
    diaSemana: string;
    horaInicio: string; 
    horaFin: string;
}

/**
 * Información completa del horario de un taller.
 */
export interface HorarioResponse {
    idHorario: number;
    idTaller: number;
    nombreTaller: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}