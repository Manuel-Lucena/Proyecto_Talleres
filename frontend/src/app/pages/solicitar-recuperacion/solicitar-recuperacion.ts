import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';

/**
 * Componente para gestionar el primer paso de recuperación de contraseña.
 * Permite al usuario introducir su email para recibir un token de acceso.
 */
@Component({
  selector: 'app-solicitar-recuperacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitar-recuperacion.html',
  styleUrl: './solicitar-recuperacion.scss'
})
export class SolicitarRecuperacion {

  // --- Propiedades de Estado ---
  public loading = false;   // Controla el estado visual de carga (spinners, bloqueo de botón)
  public enviado = false;   // Indica si la petición se ha procesado (muestra mensaje de éxito)

  // --- Formulario Reactivo ---
  public recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private usuarioService: UsuarioService
  ) {}

  /**
   * Procesa el envío del formulario.
   * Valida el email y solicita al backend el envío del correo de recuperación.
   */
  public onSubmit(): void {
    if (this.recoveryForm.valid) {
      this.loading = true;
      const email = this.recoveryForm.controls.email.value!;

      this.usuarioService.solicitarRecuperacion(email).subscribe({
        next: () => this.finalizarProceso(),
        error: (err) => {
          console.warn('Error controlado por seguridad', err);
          this.finalizarProceso();
        }
      });
    } else {
      this.recoveryForm.markAllAsTouched();
    }
  }

  /**
   * Finaliza la interacción de la vista una vez recibida la respuesta del servidor.
   * Bloquea el formulario para evitar re-envíos innecesarios.
   */
  private finalizarProceso(): void {
    this.loading = false;
    this.enviado = true;
    
    this.recoveryForm.get('email')?.disable();
  }
}