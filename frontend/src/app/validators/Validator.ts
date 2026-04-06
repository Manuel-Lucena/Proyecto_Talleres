import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

export class Validator {

  // Validador de DNI Español (8 números + Letra)
  static dni(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const validDniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    return validDniRegex.test(value) ? null : { invalidDni: true };
  }

  // Validador de Teléfono (9 dígitos)
  static telefono(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const validTelRegex = /^[0-9]{9}$/;
    return validTelRegex.test(value) ? null : { invalidTel: true };
  }

  // Validador de coincidencia de contraseñas (Para Registro)
  static passwordMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { passwordMismatch: true };
  }

  static validarFechas(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('fechaInicio')?.value;
    const fin = control.get('fechaFin')?.value;

    if (inicio && fin && new Date(inicio) > new Date(fin)) {
      return { fechaInvalida: true }; // Esta es la clave que busca el HTML
    }
    return null;
  }
}