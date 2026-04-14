import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';

@Component({
  selector: 'app-solicitar-recuperacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitar-recuperacion.html',
  styleUrl: './solicitar-recuperacion.scss'
})
export class SolicitarRecuperacion {
  public loading = false;
  public enviado = false;

  public recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private usuarioService: UsuarioService
  ) {}

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

  private finalizarProceso(): void {
    this.loading = false;
    this.enviado = true;
    // Opcional: Bloquear el input tras éxito
    this.recoveryForm.get('email')?.disable();
  }
}