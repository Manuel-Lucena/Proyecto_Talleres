import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioRequest } from '../../../interfaces/Usuario.Interface';
import { Validator } from '../../../validators/Validator'; 
import { FormErrorService } from '../../../services/FormError.Service';

/**
 * Componente de formulario para la creación y edición de alumnos.
 */
@Component({
  selector: 'app-form-alumno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-alumno.html',
  styleUrl: './form-alumno.scss',
})
export class FormAlumno implements OnInit {
  @Input() usuarioParaEditar: any | null = null; // Datos para modo edición
  @Output() usuarioGuardado = new EventEmitter<FormData>(); // Emite el formulario al padre
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal

  fileSeleccionado: File | null = null; // Archivo de imagen de perfil
  verPassword = false; // Control de visibilidad de contraseña

  /**
   * @param errorService Servicio para gestionar la visualización de errores de validación.
   */
  constructor(public errorService: FormErrorService) {}

  /** Definición del formulario reactivo con sus validadores */
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

  /**
   * Carga los datos si es edición y ajusta validaciones de contraseña.
   */
  ngOnInit(): void {
    if (this.usuarioParaEditar) {
      this.form.patchValue(this.usuarioParaEditar);
      this.form.get('password')?.clearValidators();
      this.form.get('repetirPassword')?.clearValidators();
      this.form.updateValueAndValidity();
    }
  }

  /**
   * Captura el archivo seleccionado del input.
   * @param event Evento de selección de archivos.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.fileSeleccionado = file;
  }

  /**
   * Valida y emite los datos del alumno en formato FormData.
   */
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
      idRol: rawValues.idRol || 3
    };

    formData.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));
    if (this.fileSeleccionado) formData.append('archivo', this.fileSeleccionado);

    this.usuarioGuardado.emit(formData);
  }

  /**
   * Emite el evento para cerrar el modal.
   */
  cerrarModal(): void { 
    this.cerrar.emit(); 
  }
}