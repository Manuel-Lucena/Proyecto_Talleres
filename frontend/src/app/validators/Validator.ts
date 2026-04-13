import { AbstractControl, ValidationErrors } from '@angular/forms';

export class Validator {

  // --- LÓGICA PURA (Para usar en la Tabla de Carga Masiva o donde quieras) ---
  static isEmail(value: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  }

  static isDni(value: string): boolean {
    // Regex idéntica a la de tu Java (soporta DNI y NIE)
    const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    return regex.test(value);
  }

  static isTelefono(value: string): boolean {
    const regex = /^\d{9}$/;
    return regex.test(value);
  }

  static hasMinLength(value: string, min: number): boolean {
    return value ? value.trim().length >= min : false;
  }

  // --- VALIDADORES PARA ANGULAR (Los que ya tenías, no se tocan) ---

  static dni(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return Validator.isDni(value) ? null : { invalidDni: true };
  }

  static telefono(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return Validator.isTelefono(value) ? null : { invalidTel: true };
  }

  static passwordMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { passwordMismatch: true };
  }

  static validarFechas(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('fechaInicio')?.value;
    const fin = control.get('fechaFin')?.value;
    if (inicio && fin && inicio >= fin) return { fechaInvalida: true };
    return null;
  }
}