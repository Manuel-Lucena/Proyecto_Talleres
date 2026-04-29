import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Clase de utilidad centralizada para validaciones.
 * Contiene lógica pura para comprobaciones manuales y validadores reactivos para formularios de Angular.
 */
export class Validator {

  // ===========================================================================
  // --- LÓGICA PURA ---
  // (Utilizables en lógica de negocio, carga masiva o scripts externos)
  // ===========================================================================

  /**
   * Verifica si una cadena cumple con el formato estándar de correo electrónico.
   * @param value El texto a evaluar.
   * @returns True si el formato es válido.
   */
  static isEmail(value: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  }

  /**
   * Valida un DNI o NIE español siguiendo la expresión regular de la lógica de backend.
   * @param value El documento a evaluar.
   * @returns True si el patrón coincide (8 números + letra o Letra + 7 números + letra).
   */
  static isDni(value: string): boolean {
    const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    return regex.test(value);
  }

  /**
   * Comprueba si el teléfono tiene exactamente 9 dígitos numéricos.
   * @param value El número a evaluar.
   * @returns True si es un teléfono válido.
   */
  static isTelefono(value: string): boolean {
    if (!value) return false;
    const soloNumeros = value.replace(/\D/g, '');
    return soloNumeros.length === 9;
  }
  /**
   * Valida una longitud mínima eliminando espacios en blanco innecesarios.
   * @param value El texto a evaluar.
   * @param min La cantidad mínima de caracteres requerida.
   * @returns True si cumple con el mínimo.
   */
  static hasMinLength(value: string, min: number): boolean {
    return value ? value.trim().length >= min : false;
  }

  // ===========================================================================
  // --- VALIDADORES PARA ANGULAR (Reactive Forms) ---
  // ===========================================================================

  /**
   * Validador de Angular para campos de DNI/NIE.
   * @param control El control de formulario que contiene el documento.
   * @returns Un objeto de error { invalidDni: true } o null si es correcto.
   */
  static dni(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return Validator.isDni(value) ? null : { invalidDni: true };
  }

  /**
   * Validador de Angular para campos telefónicos.
   * @param control El control de formulario que contiene el teléfono.
   * @returns Un objeto de error { invalidTel: true } o null si es correcto.
   */
  static telefono(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return Validator.isTelefono(value) ? null : { invalidTel: true };
  }

  /**
   * Validador de grupo para comparar dos campos de contraseña.
   * Requiere que el FormGroup tenga los campos 'password' y 'repetirPassword'.
   * @param control El grupo de formulario (FormGroup).
   * @returns Un objeto de error { passwordMismatch: true } o null si coinciden.
   */
  static passwordMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { passwordMismatch: true };
  }

  /**
   * Validador de grupo para rangos de fechas de talleres.
   * Asegura que la fecha de finalización no sea anterior a la de inicio.
   * @param control El grupo de formulario (FormGroup).
   * @returns Un objeto de error { fechaInvalida: true } o null si el rango es lógico.
   */
  static validarFechas(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('fechaInicio')?.value;
    const fin = control.get('fechaFin')?.value;

    if (inicio && fin && inicio >= fin) {
      return { fechaInvalida: true };
    }
    return null;
  }
}