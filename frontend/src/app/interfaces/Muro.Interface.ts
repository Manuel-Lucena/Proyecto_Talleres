import { TareaResponse } from './Tarea.Interface';
import { MaterialResponse } from './Material.Interface';

/**
 * Tipo híbrido para el feed del muro.
 * Combina Tareas y Materiales agregando un discriminador para facilitar el renderizado.
 */
export type ActividadMuro = (TareaResponse | MaterialResponse) & { tipo: 'TAREA' | 'MATERIAL' };