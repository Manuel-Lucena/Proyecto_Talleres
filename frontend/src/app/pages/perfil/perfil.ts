import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../services/Usuario.Service';
import { TokenService } from '../../services/Token.Service';
import { NotificacionService } from '../../services/Notificacion.Service';
import { Validator } from '../../validators/Validator';

import { Navbar } from "../../components/layout/navbar/navbar";
import { UsuarioResponse } from '../../interfaces/Usuario.Interface';
import { Confirmacion } from "../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../components/dialogs/mensaje/notificacion";

/**
 * Componente para la gestión del perfil del usuario autenticado.
 * Permite visualizar datos personales, actualizar información y cambiar la foto de perfil.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Confirmacion, Notificacion],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  usuario: UsuarioResponse | null = null; // Datos del usuario actual
  perfilForm!: FormGroup; // Formulario reactivo para la edición del perfil

  /**
   * @param fb Constructor de formularios reactivos.
   * @param usuarioService Operaciones CRUD de usuarios.
   * @param tokenService Gestión de sesión y credenciales.
   * @param notify Servicio centralizado de alertas.
   * @param cdr Detección manual de cambios para flujos asíncronos.
   */
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private tokenService: TokenService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa la estructura del formulario y carga los datos del usuario.
   */
  ngOnInit(): void {
    this.initForm();
    this.cargarDatosUsuario();
  }

  /**
   * Configura los controles y validaciones del formulario.
   */
  private initForm(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', { validators: [Validators.required], updateOn: 'blur' }],
      apellidos: ['', { validators: [Validators.required], updateOn: 'blur' }],
      email: ['', { validators: [Validators.required, Validators.email], updateOn: 'blur' }],
      telefono: ['', { validators: [Validator.telefono], updateOn: 'blur' }],
      direccion: ['', { updateOn: 'blur' }],
      dni: [{ value: '', disabled: true }]
    });
  }

  /**
   * Recupera la información del usuario autenticado desde el servidor.
   */
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

  /**
   * Helper para validar la visibilidad de errores en el template.
   */
  mostrarError(controlName: string): boolean {
    const control = this.perfilForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Retorna el mensaje de error correspondiente según la validación fallida.
   */
  getErrorMessage(controlName: string): string {
    const control = this.perfilForm.get(controlName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['invalidTel']) return 'Teléfono no válido';
    return 'Campo inválido';
  }

  /**
   * Valida y procesa la actualización de los datos del perfil.
   */
  actualizarPerfil(): void {
    if (this.perfilForm.valid && this.usuario) {
      this.enviarDatos(this.prepararFormData());
    } else {
      this.perfilForm.markAllAsTouched();
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Revisa los errores del formulario', tipo: 'info' });
    }
  }

  /**
   * Gestiona la actualización inmediata del perfil al seleccionar una nueva imagen.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.usuario) {
      const fd = this.prepararFormData();
      fd.append('archivo', file);
      this.enviarDatos(fd);
    }
  }

  /**
   * Construye el objeto FormData incluyendo el DTO del usuario como Blob JSON.
   */
  private prepararFormData(): FormData {
    const fd = new FormData();
    const valores = this.perfilForm.getRawValue();

    const ROLES_MAP: { [key: string]: number } = {
      'ADMIN': 1,
      'PROFESOR': 2,
      'ALUMNO': 3
    };

    const idRol = ROLES_MAP[this.usuario?.nombreRol || 'ALUMNO'] || 3;

    const usuarioDTO = {
      dni: this.usuario?.dni, 
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email,
      telefono: valores.telefono,
      direccion: valores.direccion,
      idRol: idRol
    };

    fd.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));
    return fd;
  }

  /**
   * Envía la petición de actualización al servidor y gestiona la respuesta.
   */
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

  /**
   * Solicita confirmación y cierra la sesión del usuario.
   */
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