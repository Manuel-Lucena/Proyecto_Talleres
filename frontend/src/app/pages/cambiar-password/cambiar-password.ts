import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';
import { NotificacionService } from '../../services/Notificacion.Service';
import { PasswordChangeRequest } from '../../interfaces/Auth.Interface';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.scss'
})
export class CambiarPassword implements OnInit {
  public verPassword = false;
  public loading = false;
  public mensajeError = '';
  public token: string = '';

  public resetForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    public notificacionService: NotificacionService, // Cambiado a public por si lo necesitas en el HTML
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.mensajeError = 'El enlace no es válido o ha expirado.';
    }
  }

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
          tipo: 'exito' // Asumo que 'exito' es uno de tus tipos en ModalConfig
        });

        // Redirigimos tras un breve delay para que vean el modal
        setTimeout(() => {
          this.notificacionService.cerrar(); // Cerramos el modal antes de irnos
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
      }
    });
  }
}