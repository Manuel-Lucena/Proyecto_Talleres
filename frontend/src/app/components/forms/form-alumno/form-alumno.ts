import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsuarioRequest } from '../../../models/Usuario.Interface';

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
    dni: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    repetirPassword: new FormControl('', [Validators.required]), 
    idRol: new FormControl(2)
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    if (this.usuarioParaEditar) {
      this.form.patchValue(this.usuarioParaEditar);
      this.form.get('password')?.clearValidators();
      this.form.get('repetirPassword')?.clearValidators();
      this.form.updateValueAndValidity();
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { passwordMismatch: true };
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
      password: rawValues.password!,
      idRol: rawValues.idRol || 2
    };

    formData.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));
    if (this.fileSeleccionado) formData.append('archivo', this.fileSeleccionado);

    this.usuarioGuardado.emit(formData);
  }

  cerrarModal() { this.cerrar.emit(); }
}