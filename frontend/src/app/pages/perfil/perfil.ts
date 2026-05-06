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
import { Router } from '@angular/router';

/**
 * Componente para la gestión integral del perfil del usuario autenticado.
 * Permite la visualización de datos, actualización de información personal 
 * y gestión de la imagen de perfil mediante multipart/form-data.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Confirmacion, Notificacion],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {

  // --- Propiedades de Datos ---
  usuario: UsuarioResponse | null = null; // Almacena la entidad del usuario desde la API
  perfilForm!: FormGroup;                  // Formulario reactivo para la edición de campos

  /**
   * @param fb Constructor de formularios reactivos.
   * @param usuarioService Operaciones CRUD y de archivos para usuarios.
   * @param tokenService Gestión de JWT y datos de sesión local.
   * @param notify Servicio centralizado para feedback visual.
   * @param cdr Forzado de detección de cambios en respuestas asíncronas.
   * 
   */
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private tokenService: TokenService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  
  ) { }

  /**
   * Ciclo de vida: Inicializa la estructura del formulario y solicita los datos al servidor.
   */
  ngOnInit(): void {
    this.initForm();
    this.cargarDatosUsuario();
  }

  /**
   * Configura los controles del formulario y sus reglas de validación.
   * Se utiliza 'updateOn: blur' para optimizar el rendimiento de la validación visual.
   */
  private initForm(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', { validators: [Validators.required], updateOn: 'blur' }],
      apellidos: ['', { validators: [Validators.required], updateOn: 'blur' }],
      email: ['', { validators: [Validators.required, Validators.email], updateOn: 'blur' }],
      telefono: ['', { validators: [Validator.telefono], updateOn: 'blur' }],
      direccion: ['', { updateOn: 'blur' }],
      dni: [{ value: '', disabled: true }] // El DNI se mantiene bloqueado por seguridad
    });
  }

  /**
   * Recupera la información completa del perfil del usuario actual usando su ID de sesión.
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

  // ===========================================================================
  // --- GESTIÓN DE ERRORES DE INTERFAZ ---
  // ===========================================================================

  /**
   * Evalúa si un campo debe mostrar estilos de error.
   * @param controlName Nombre del control en el formulario.
   */
  mostrarError(controlName: string): boolean {
    const control = this.perfilForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Resuelve el mensaje descriptivo del error para el usuario.
   * @param controlName Nombre del control a evaluar.
   */
  getErrorMessage(controlName: string): string {
    const control = this.perfilForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['invalidTel']) return 'Teléfono no válido';

    return 'Campo inválido';
  }

  // ===========================================================================
  // --- PROCESAMIENTO DE DATOS Y ARCHIVOS ---
  // ===========================================================================

  /**
   * Ejecuta la actualización de los datos de texto del perfil.
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
   * Gestiona el cambio de foto de perfil. Dispara la actualización inmediatamente tras elegir archivo.
   * @param event Evento de selección de archivo del input type="file".
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
   * Centraliza la creación del objeto FormData necesario para peticiones Multipart.
   * Envía el objeto Usuario como un Blob con tipo application/json.
   * @returns FormData configurado para el backend.
   */
  private prepararFormData(): FormData {
    const fd = new FormData();
    const valores = this.perfilForm.getRawValue();

    const ROLES_MAP: { [key: string]: number } = { 'ADMIN': 1, 'PROFESOR': 2, 'ALUMNO': 3 };
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
   * Realiza la llamada al servicio de actualización y gestiona el refresco de la sesión.
   * @param fd Datos a enviar al servidor.
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

          this.notify.mostrar({
            titulo: '¡Éxito!',
            mensaje: 'Tu perfil se ha actualizado correctamente',
            tipo: 'exito'
          });

          this.cdr.detectChanges();

        }
      },
      error: () => {
        this.notify.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar', tipo: 'error' });
      }
    });
  }

  /**
   * Finaliza la sesión del usuario tras confirmación.
   */
  async logout(): Promise<void> {
    const confirmar = await this.notify.confirmar({
      titulo: 'Cerrar Sesión',
      mensaje: '¿Estás seguro de que deseas salir?'
    });

    if (confirmar) {
      this.tokenService.logOut();
      this.router.navigate(['/login']);
    }
  }
}