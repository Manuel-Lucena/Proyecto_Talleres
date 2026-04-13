import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';
import { LoginRequest } from '../../interfaces/Auth.Interface';
import { FormAlumno } from '../../components/forms/form-alumno/form-alumno';

/**
 * Componente encargado de la autenticación de usuarios y acceso al registro.
 * Gestiona el formulario de inicio de sesión y la apertura del modal para nuevos alumnos.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormAlumno],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  public verPassword = false; // Control de visibilidad del texto de la contraseña
  public errorLogin = false; // Flag para mostrar alertas de credenciales incorrectas
  public mensajeError = ''; // Texto descriptivo del error de autenticación
  public mostrarModalRegistro = false; // Estado de visibilidad del modal de registro

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  /**
   * @param usuarioService Operaciones de autenticación y creación de usuarios.
   * @param router Gestión de navegación tras login/registro exitoso.
   * @param cdr Detección de cambios manual para respuestas asíncronas de error.
   */
  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Alterna el tipo de input del campo contraseña entre 'password' y 'text'.
   */
  public togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  /**
   * Valida el formulario de inicio de sesión e inicia el proceso de autenticación.
   */
  public onSubmit(): void {
    this.errorLogin = false;
    this.mensajeError = '';

    if (this.loginForm.valid) {
      this.execLogin();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  /**
   * Realiza la petición de login al servidor y redirige al usuario si es exitosa.
   */
  private execLogin(): void {
    const datos: LoginRequest = {
      email: this.loginForm.controls.email.value!,
      password: this.loginForm.controls.password.value!
    };

    this.usuarioService.login(datos).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res.mensaje);
        this.router.navigate(['/landing']);
      },
      error: (err: any) => {
        this.errorLogin = true;
        this.mensajeError = 'Email o contraseña incorrectos';
        this.cdr.detectChanges();
        console.error('Detalle técnico:', err);
      }
    });
  }

  /**
   * Activa la visibilidad del modal de registro de alumnos.
   */
  public abrirRegistro(): void {
    this.mostrarModalRegistro = true;
  }

  /**
   * Desactiva la visibilidad del modal de registro de alumnos.
   */
  public cerrarRegistro(): void {
    this.mostrarModalRegistro = false;
  }

  /**
   * Procesa la creación de un nuevo usuario desde el formulario de registro.
   * Almacena el token recibido y redirige a la página principal.
   * @param formData Datos multiparte del nuevo alumno (incluye DTO e imagen).
   */
  public onAlumnoGuardado(formData: FormData): void {
    this.usuarioService.crearUsuario(formData).subscribe({
      next: (res) => {
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        this.cerrarRegistro();
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        console.error('Error durante el registro:', err);
      }
    });
  }
}