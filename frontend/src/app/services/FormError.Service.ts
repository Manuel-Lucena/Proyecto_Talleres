import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Servicio centralizado para la gestión y visualización de errores en formularios reactivos.
 * Proporciona métodos para determinar cuándo mostrar un error y qué mensaje proyectar.
 */
@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  /**
   * Determina si un error debe ser visible en la interfaz de usuario.
   * El error solo se muestra si el control es inválido y el usuario ya ha interactuado con él (touched).
   * * @param form El grupo de formulario que contiene el control.
   * @param controlName El nombre de la propiedad/campo a validar.
   * @returns Boolean: true si se cumplen las condiciones para mostrar el error.
   */
  public mostrarError(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Resuelve el mensaje descriptivo del error basándose en las validaciones fallidas.
   * Maneja tanto errores de controles individuales como errores cruzados a nivel de grupo.
   * * @param form El grupo de formulario que contiene el control.
   * @param controlName El nombre del campo del cual queremos obtener el mensaje.
   * @returns String con el mensaje de error amigable para el usuario.
   */
  public getErrorMessage(form: FormGroup, controlName: string): string {
    // 1. Obtención del control individual
    const control = form.get(controlName);

    // --- Lógica de errores específicos del control ---
    if (control && control.errors) {
      const errors = control.errors;
      if (errors['repetido']) return errors['repetido'];
      if (errors['required']) return 'Este campo es obligatorio';
      if (errors['email']) return 'Email inválido';
      if (errors['minlength']) {
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
      if (errors['invalidDni']) return 'DNI no válido';
      if (errors['invalidTel']) return 'Teléfono no válido';
    }

    // --- Lógica de errores de validación cruzada (Group Errors) ---
    // Caso especial: Validación de rango de fechas aplicada al contenedor
    if (controlName === 'fechaFin' && form.hasError('fechaInvalida')) {
      return 'La hora de fin debe ser posterior';
    }

    return 'Campo no válido';
  }
}