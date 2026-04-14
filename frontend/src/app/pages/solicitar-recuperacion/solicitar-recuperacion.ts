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
  public mensajeError = '';

  public recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  public onSubmit(): void {
    if (this.recoveryForm.valid) {
      this.loading = true;
      this.mensajeError = '';
      
      const email = this.recoveryForm.controls.email.value!;

      this.usuarioService.solicitarRecuperacion(email).subscribe({
        next: () => {
          this.enviado = true;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.mensajeError = 'No se pudo procesar la solicitud. Inténtalo de nuevo.';
          console.error(err);
        }
      });
    } else {
      this.recoveryForm.markAllAsTouched();
    }
  }
}