import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root' // Disponible en toda la app
})
export class FormErrorService {

  public mostrarError(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  public getErrorMessage(form: FormGroup, controlName: string): string {
  // 1. Primero miramos si el control individual tiene errores
  const control = form.get(controlName);
  
  if (control && control.errors) {
    const errors = control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['invalidDni']) return 'DNI no válido';
    if (errors['invalidTel']) return 'Teléfono no válido';
  }

  // 2. Si el control es 'fechaFin', miramos si el GRUPO tiene el error de fechaInvalida
  if (controlName === 'fechaFin' && form.hasError('fechaInvalida')) {
    return 'La hora de fin debe ser posterior';
  }
  
  return 'Campo no válido';
}
}