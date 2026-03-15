import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../services/Usuario.Service';
import { TokenService } from '../../services/Token.Service';
import { NotificacionService } from '../../services/Notificacion.Service';
import { Validator } from '../../validators/Validator'; 


import { Navbar } from "../../components/layout/navbar/navbar";
import { UsuarioResponse } from '../../interfaces/Usuario.Interface';
import { Confirmacion } from "../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../components/dialogs/mensaje/notificacion";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Confirmacion, Notificacion],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  usuario: UsuarioResponse | null = null;
  perfilForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private tokenService: TokenService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarDatosUsuario();
  }

  private initForm(): void {
    this.perfilForm = this.fb.group({
      // Usamos updateOn: 'blur' para que el error solo salga al salir del input
      nombre: ['', { validators: [Validators.required], updateOn: 'blur' }],
      apellidos: ['', { validators: [Validators.required], updateOn: 'blur' }],
      email: ['', { validators: [Validators.required, Validators.email], updateOn: 'blur' }],
      telefono: ['', { validators: [Validator.telefono], updateOn: 'blur' }],
      direccion: ['', { updateOn: 'blur' }],
      dni: [{ value: '', disabled: true }]
    });
  }

  cargarDatosUsuario(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      this.usuarioService.obtenerPorId(userId).subscribe({
        next: (res) => {
          if (res.data) {
            this.usuario = res.data;
            this.perfilForm.patchValue(this.usuario);
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.notify.mostrar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos', tipo: 'error' });
        }
      });
    }
  }

  // Helpers para mostrar errores en el HTML
  mostrarError(controlName: string): boolean {
    const control = this.perfilForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.perfilForm.get(controlName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['invalidTel']) return 'Teléfono no válido';
    return 'Campo inválido';
  }

  actualizarPerfil(): void {
    if (this.perfilForm.valid && this.usuario) {
      this.enviarDatos(this.prepararFormData());
    } else {
      this.perfilForm.markAllAsTouched();
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Revisa los errores del formulario', tipo: 'info' });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.usuario) {
      const fd = this.prepararFormData();
      fd.append('archivo', file);
      this.enviarDatos(fd);
    }
  }

  private prepararFormData(): FormData {
    const fd = new FormData();
    const valores = this.perfilForm.getRawValue();

    const usuarioDTO = {
      dni: this.usuario?.dni,
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email,
      telefono: valores.telefono,
      direccion: valores.direccion,
      idRol: (this.usuario as any).idRol || 1
    };

    fd.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));
    return fd;
  }

  private enviarDatos(fd: FormData): void {
    const id = this.usuario?.idUsuario;
    if (!id) return;

    this.usuarioService.actualizarUsuario(id, fd).subscribe({
      next: (res) => {
        if (res.data) {
          if (res.data.token) localStorage.setItem('token', res.data.token);
          this.usuario = res.data;
          this.perfilForm.patchValue(this.usuario);
          this.cdr.detectChanges();
          this.notify.mostrar({ titulo: 'Éxito', mensaje: 'Perfil actualizado', tipo: 'exito' });
        }
      },
      error: () => {
        this.notify.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar', tipo: 'error' });
      }
    });
  }

  async logout(): Promise<void> {
    const confirmar = await this.notify.confirmar({
      titulo: 'Cerrar Sesión',
      mensaje: '¿Estás seguro de que deseas salir?'
    });
    if (confirmar) {
      this.tokenService.logOut();
      window.location.href = '/login';
    }
  }
}