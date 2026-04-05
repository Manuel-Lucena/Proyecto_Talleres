import { TareaResponse } from './Tarea.Interface';
import { MaterialResponse } from './Material.Interface'; // Asumiendo que existe

export type ActividadMuro = (TareaResponse | MaterialResponse) & { tipo: 'TAREA' | 'MATERIAL' };