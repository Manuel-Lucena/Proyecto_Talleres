import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';
import { NotificacionService } from '../../services/Notificacion.Service';
import { PasswordChangeRequest } from '../../interfaces/Auth.Interface';

/**
 * Componente para el restablecimiento de credenciales.
 * Gestiona el paso final del flujo de "Olvidé mi contraseña", validando el token
 * enviado por correo y permitiendo al usuario definir una nueva clave de acceso.
 */
@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.scss'
})
export class CambiarPassword implements OnInit {

  // --- Estado de la Interfaz ---
  public verPassword = false;      // Permite alternar la visibilidad de los caracteres
  public loading = false;          // Estado de carga para bloquear el botón durante la petición
  public mensajeError = '';        // Feedback de validaciones locales (no coincide, token vacío)
  public token: string = '';       // Token de seguridad recuperado de la Query String

  // --- Formulario Reactivo ---
  public resetForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  /**
   * @param route Servicio para interceptar parámetros de la URL.
   * @param usuarioService Operaciones de seguridad y cambio de credenciales.
   * @param notificacionService Diálogos globales para feedback de éxito/error.
   * @param router Redirección al login tras completar el flujo.
   */
  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    public notificacionService: NotificacionService,
    private router: Router
  ) {}

  /**
   * Ciclo de vida: Al arrancar, extrae el token de la URL (ej: ?token=abc...).
   * Si no existe, invalida el proceso inmediatamente.
   */
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.mensajeError = 'El enlace no es válido o ha expirado.';
    }
  }

  /**
   * Ejecuta el proceso de cambio de contraseña previo filtrado de errores comunes.
   */
  public onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.mensajeError = '';

    const payload: PasswordChangeRequest = {
      token: this.token,
      nuevaPassword: this.resetForm.value.password!
    };

    this.usuarioService.restablecerPassword(payload).subscribe({
      next: () => {
        this.notificacionService.mostrar({
          titulo: '¡Éxito!',
          mensaje: 'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión.',
          tipo: 'exito'
        });

        setTimeout(() => {
          this.notificacionService.cerrar();
          this.router.navigate(['/login']);
        }, 4000);
      },
      error: (err) => {
        this.loading = false;
        this.mensajeError = 'El enlace ha expirado o no es válido.';
        this.notificacionService.mostrar({
          titulo: 'Error',
          mensaje: 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
          tipo: 'error'
        });
        console.error('Error Reset Password:', err);
      }
    });
  }
}