import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioRequest } from '../../../interfaces/Usuario.Interface';
import { Validator } from '../../../validators/Validator'; 

@Component({
  selector: 'app-form-alumno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-alumno.html',
  styleUrl: './form-alumno.scss',
})
export class FormAlumno implements OnInit {
  @Input() usuarioParaEditar: any | null = null;
  @Output() usuarioGuardado = new EventEmitter<FormData>();
  @Output() cerrar = new EventEmitter<void>();

  fileSeleccionado: File | null = null;
  verPassword = false;

  form = new FormGroup({
    dni: new FormControl('', { validators: [Validators.required, Validator.dni], updateOn: 'blur' }),
    nombre: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    apellidos: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    email: new FormControl('', { validators: [Validators.required, Validators.email], updateOn: 'blur' }),
    telefono: new FormControl('', { validators: [Validator.telefono], updateOn: 'blur' }),
    direccion: new FormControl('', { updateOn: 'blur' }), 
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], updateOn: 'blur' }),
    repetirPassword: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    idRol: new FormControl(3)
  }, { validators: Validator.passwordMatch });

  ngOnInit(): void {
    if (this.usuarioParaEditar) {
      this.form.patchValue(this.usuarioParaEditar);
      this.form.get('password')?.clearValidators();
      this.form.get('repetirPassword')?.clearValidators();
      this.form.updateValueAndValidity();
    }
  }

  mostrarError(controlName: string): boolean {
    const control = this.form.get(controlName);
    // Solo mostramos error si el usuario ha salido del campo (touched)
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['minlength']) return 'Mínimo 6 caracteres';
    if (control.errors['invalidDni']) return 'DNI no válido';
    if (control.errors['invalidTel']) return 'Teléfono no válido';
    
    return 'Campo inválido';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.fileSeleccionado = file;
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const rawValues = this.form.getRawValue();

    const usuarioDTO: UsuarioRequest = {
      dni: rawValues.dni!,
      nombre: rawValues.nombre!,
      apellidos: rawValues.apellidos!,
      email: rawValues.email!,
      telefono: rawValues.telefono!,
      direccion: rawValues.direccion!, 
      password: rawValues.password || undefined,
      idRol: rawValues.idRol || 2
    };

    formData.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));
    if (this.fileSeleccionado) formData.append('archivo', this.fileSeleccionado);

    this.usuarioGuardado.emit(formData);
  }

  cerrarModal() { this.cerrar.emit(); }
}