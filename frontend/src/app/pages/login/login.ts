import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';
import { LoginRequest } from '../../interfaces/Auth.Interface';
import { FormAlumno } from '../../components/forms/form-alumno/form-alumno';
import { RouterModule } from '@angular/router';

/**
 * Componente de acceso y puerta de entrada al sistema.
 * Gestiona el flujo de autenticación de usuarios existentes y proporciona 
 * el punto de acceso al registro de nuevos alumnos a través de un modal dinámico.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormAlumno, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  // --- Estado de la Interfaz ---
  public verPassword = false;       // Alterna entre ocultar/mostrar caracteres del password
  public errorLogin = false;        // Dispara la visualización de alertas de error en el template
  public mensajeError = '';         // Mensaje amigable para el usuario en caso de fallo
  public mostrarModalRegistro = false; // Controla la visibilidad del componente de registro (FormAlumno)
  @ViewChild(FormAlumno) formAlumno!: FormAlumno; //Controla el formulario del hijo para mostrar errores devueltos por el back

  // --- Formulario Reactivo ---
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  /**
   * @param usuarioService Servicio de comunicación con la API de seguridad y usuarios.
   * @param router Sistema de navegación para redirecciones post-login.
   * @param cdr Necesario para asegurar que los mensajes de error se pinten tras fallos asíncronos.
   */
  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Mejora la UX permitiendo al usuario revisar la contraseña introducida.
   */
  public togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  /**
   * Punto de entrada del formulario. Realiza validaciones previas al envío.
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
   * Orquestador de la llamada de autenticación.
   * Si el login es correcto, el servicio se encarga de persistir el token y redirigimos.
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
        console.error('Detalle técnico del error:', err);
      }
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE REGISTRO (MODAL) ---
  // ===========================================================================

  public abrirRegistro(): void {
    this.mostrarModalRegistro = true;
  }

  public cerrarRegistro(): void {
    this.mostrarModalRegistro = false;
  }

  /**
   * Callback ejecutado cuando el componente hijo (FormAlumno) emite un nuevo registro.
   * Maneja el auto-login tras el registro exitoso guardando el token.
   * @param formData Objeto Multipart con los datos del alumno y su imagen.
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
        const msg = err.error?.message || "";

        if (msg.toLowerCase().includes('email')) {
          this.formAlumno.form.get('email')?.setErrors({ repetido: 'Este email ya está registrado' });
          this.formAlumno.form.get('email')?.markAsTouched();
        }

        if (msg.toLowerCase().includes('dni') || msg.toLowerCase().includes('identificación')) {
          this.formAlumno.form.get('dni')?.setErrors({ repetido: 'Este DNI ya está registrado' });
          this.formAlumno.form.get('dni')?.markAsTouched();
        }

       
        this.cdr.detectChanges();
      }
    });
  }
}