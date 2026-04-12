import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
import { FormAlumno } from '../../../../components/forms/form-alumno/form-alumno';
import { FormCargaUsuarios } from '../../../../components/forms/form-carga-usuarios/form-carga-usuarios';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormAlumno, FormCargaUsuarios, Confirmacion, Notificacion],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  usuarios: UsuarioResponse[] = [];
  busqueda: string = '';
  filtroRol: string = '';
  criterioBusqueda: string = 'todos';

  mostrarModal: boolean = false;
  mostrarModalCarga: boolean = false; // Control del nuevo modal
  usuarioSeleccionado: UsuarioResponse | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (res) => {
        this.usuarios = [...res.data];
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    return this.usuarios.filter(u => {
      const cumpleRol = this.filtroRol === '' || u.nombreRol === this.filtroRol;
      if (!cumpleRol) return false;
      if (!term) return true;

      switch (this.criterioBusqueda) {
        case 'nombre':
          return (u.nombre + ' ' + u.apellidos).toLowerCase().includes(term);
        case 'dni':
          return u.dni.toLowerCase().includes(term);
        case 'email':
          return u.email.toLowerCase().includes(term);
        default:
          return (u.nombre + u.apellidos + u.dni + u.email).toLowerCase().includes(term);
      }
    });
  }

  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre': return 'Buscar por nombre...';
      case 'dni': return 'Buscar por DNI...';
      case 'email': return 'Buscar por correo...';
      default: return 'Búsqueda general...';
    }
  }

  abrirCrear() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirEditar(u: UsuarioResponse) {
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(u));
    this.mostrarModal = true;
  }

  ejecutarGuardado(fd: FormData): void {
    const esEdicion = !!this.usuarioSeleccionado;

    const peticion$ = (esEdicion
      ? this.usuarioService.actualizarUsuario(this.usuarioSeleccionado!.idUsuario, fd)
      : this.usuarioService.crearUsuario(fd)) as import('rxjs').Observable<any>;

    peticion$.subscribe({
      next: () => {
        this.notificacionService.mostrar({
          titulo: 'Éxito',
          mensaje: esEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado con éxito',
          tipo: 'exito'
        });
        this.mostrarModal = false;
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error en la operación:', err);
        const mensajeError = err.error?.mensaje || 'No se pudo completar la operación. Inténtalo de nuevo.';

        this.notificacionService.mostrar({
          titulo: 'Error',
          mensaje: mensajeError,
          tipo: 'error'
        });
      }
    });
  }

  toggleEstado(u: UsuarioResponse) {
    this.notificacionService.confirmar({
      titulo: u.activo ? 'Dar de baja' : 'Reactivar',
      mensaje: `¿Cambiar estado de ${u.nombre}?`,
    }).then((confirmado) => {
      if (confirmado) {
        const fd = new FormData();
        const dto = { ...u, activo: !u.activo, idRol: (u as any).idRol || 3 };
        fd.append('usuario', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        this.usuarioService.actualizarUsuario(u.idUsuario, fd).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Estado actualizado', tipo: 'exito' });
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  eliminarUsuario(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar?',
      mensaje: 'Esta acción no se puede deshacer.',
    }).then((conf) => {
      if (conf) {
        this.usuarioService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Eliminado', mensaje: 'Usuario borrado', tipo: 'exito' });
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  verInscripciones(idUsuario: number) {
    this.router.navigate(['/panel-admin/usuarios', idUsuario, 'inscripciones']);
  }
}