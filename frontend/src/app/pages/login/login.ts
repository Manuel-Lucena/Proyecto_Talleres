import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/Usuario.Service';
import { LoginRequest } from '../../interfaces/Auth.Interface';
import { FormAlumno } from '../../components/forms/form-alumno/form-alumno';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormAlumno],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Propiedades para el Login
  public verPassword = false;
  public errorLogin = false;
  public mensajeError = '';

  // Propiedades para el Modal de Registro
  public mostrarModalRegistro = false;

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // --- MÉTODOS DE LOGIN ---

  public togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  public onSubmit(): void {
    this.errorLogin = false;
    this.mensajeError = '';

    if (this.loginForm.valid) {
      this.execLogin();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

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

  // --- MÉTODOS DEL MODAL DE REGISTRO ---

  public abrirRegistro(): void {
    this.mostrarModalRegistro = true;
  }

  public cerrarRegistro(): void {
    this.mostrarModalRegistro = false;
  }

  public onAlumnoGuardado(formData: FormData): void {
    this.usuarioService.crearUsuario(formData).subscribe({
      next: (res) => {
        // res.data ahora es un AuthResponseDTO con el token
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        this.cerrarRegistro();
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        console.error('Error:', err);
        // Aquí puedes usar tu nuevo Modal de Mensaje para mostrar el error
      }
    });
  }
}