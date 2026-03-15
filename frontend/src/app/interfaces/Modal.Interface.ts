export interface ModalConfig {
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

export interface ConfirmacionConfig {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}