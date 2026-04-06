/**
 * Configuración para mostrar alertas informativas (Éxito, Error o Info).
 */
export interface ModalConfig {
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

/**
 * Configuración para ventanas de diálogo que requieren acción del usuario.
 */
export interface ConfirmacionConfig {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}