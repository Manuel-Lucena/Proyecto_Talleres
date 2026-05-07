import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioRequest } from '../../../interfaces/Usuario.Interface';
import { Validator } from '../../../validators/Validator';
import { FormErrorService } from '../../../services/FormError.Service';
import { TokenService } from '../../../services/Token.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE ALUMNOS: Formulario para el alta, edición y gestión de perfiles de estudiantes.
 */
@Component({
  selector: 'app-form-alumno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-alumno.html',
  styleUrl: './form-alumno.scss',
})
export class FormAlumno implements OnInit {
  // --- Propiedades de Entrada y Salida ---
  @Input() usuarioParaEditar: any | null = null;    // Datos para la carga en modo edición
  @Output() usuarioGuardado = new EventEmitter<FormData>(); // Emisión de datos hacia el componente padre
  @Output() cerrar = new EventEmitter<void>();      // Notificador de cierre para el modal

  // --- Propiedades de Estado y UI ---
  fileSeleccionado: File | null = null;             // Referencia al archivo de imagen en memoria
  verPassword: boolean = false;                     // Flag de control para visibilidad de campos de texto
  esAdmin: boolean = false;                         // Flag para determinar privilegios de edición de rol

  /** Estructura reactiva con validaciones de identidad y seguridad */
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
   * @param errorService Gestor de mensajes de validación para el template.
   * @param tokenService Servicio para la verificación de roles del usuario activo.
   */
  constructor(
    public errorService: FormErrorService,
    private tokenService: TokenService
  ) { 
    this.esAdmin = this.tokenService.getRol() === 'ADMIN';
  }

  /**
   * Ciclo de vida: Inicia la carga de datos y ajusta los requisitos de seguridad según el modo.
   */
  ngOnInit(): void {
    if (this.usuarioParaEditar) {
      this.cargarDatosEdicion();
    }
  }

  // ===========================================================================
  // --- CARGA Y CONFIGURACIÓN ---
  // ===========================================================================

  /**
   * Mapea los valores del alumno seleccionado y flexibiliza los validadores de clave.
   */
  private cargarDatosEdicion(): void {
    this.form.patchValue(this.usuarioParaEditar);
    
    this.form.get('password')?.clearValidators();
    this.form.get('repetirPassword')?.clearValidators();
    this.form.updateValueAndValidity();
  }

  // ===========================================================================
  // --- GESTIÓN DE ARCHIVOS Y ENVÍO ---
  // ===========================================================================

  /**
   * Captura el archivo del input para su posterior empaquetado.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.fileSeleccionado = file;
  }

  /**
   * Valida la integridad del perfil y emite el FormData para el envío multiparte.
   */
  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const raw = this.form.getRawValue();

    const usuarioDTO: UsuarioRequest = {
      dni: raw.dni!,
      nombre: raw.nombre!,
      apellidos: raw.apellidos!,
      email: raw.email!,
      telefono: raw.telefono!,
      direccion: raw.direccion!,
      password: raw.password || undefined,
      idRol: Number(raw.idRol) || 3
    };

    formData.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));

    if (this.fileSeleccionado) {
      formData.append('archivo', this.fileSeleccionado);
    }

    this.usuarioGuardado.emit(formData);
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Solicita el cierre del componente.
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }
}