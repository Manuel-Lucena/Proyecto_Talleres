import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
import { FormAlumno } from '../../../../components/forms/form-alumno/form-alumno';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormAlumno, Confirmacion, Notificacion],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  usuarios: UsuarioResponse[] = [];
  busqueda: string = '';
  filtroRol: string = '';
  mostrarModal: boolean = false;
  usuarioSeleccionado: UsuarioResponse | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
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
    return this.usuarios.filter(u =>
      (u.nombre + u.apellidos + u.dni + u.email).toLowerCase().includes(term) &&
      (this.filtroRol === '' || u.nombreRol === this.filtroRol)
    );
  }

  abrirCrear() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirEditar(u: UsuarioResponse) {
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(u));
    this.mostrarModal = true;
  }

  // --- GUARDAR (CREAR O EDITAR) ---
  ejecutarGuardado(fd: FormData): void {
    if (this.usuarioSeleccionado) {
      // MODO EDICIÓN
      this.usuarioService.actualizarUsuario(this.usuarioSeleccionado.idUsuario, fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Usuario actualizado correctamente', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarUsuarios();
        },
        error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar', tipo: 'error' })
      });
    } else {
      // MODO CREACIÓN
      this.usuarioService.crearUsuario(fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Usuario creado con éxito', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarUsuarios();
        },
        error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'Error al crear usuario', tipo: 'error' })
      });
    }
  }

  // --- CAMBIAR ESTADO (ACTIVO/INACTIVO) ---
  toggleEstado(u: UsuarioResponse) {
    this.notificacionService.confirmar({
      titulo: u.activo ? 'Dar de baja' : 'Reactivar',
      mensaje: `¿Estás seguro de cambiar el estado de ${u.nombre}?`,
      textoConfirmar: 'Confirmar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        const fd = new FormData();
        const usuarioDTO = {
          idUsuario: u.idUsuario,
          dni: u.dni,
          nombre: u.nombre,
          apellidos: u.apellidos,
          email: u.email,
          telefono: u.telefono,
          direccion: u.direccion,
          idRol: (u as any).idRol || (u.nombreRol === 'ADMIN' ? 1 : 3),
          activo: !u.activo 
        };
        fd.append('usuario', new Blob([JSON.stringify(usuarioDTO)], { type: 'application/json' }));

        this.usuarioService.actualizarUsuario(u.idUsuario, fd).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Estado actualizado', tipo: 'exito' });
            this.cargarUsuarios();
          }
        });
      }
    });
  }

  // --- ELIMINAR CON CONFIRMACIÓN ---
  eliminarUsuario(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar permanentemente?',
      mensaje: 'Esta acción borrará al usuario de forma definitiva y no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.usuarioService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Eliminado', mensaje: 'El usuario ha sido borrado', tipo: 'exito' });
            this.cargarUsuarios();
          },
          error: () => {
            this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo eliminar el usuario', tipo: 'error' });
          }
        });
      }
    });
  }
}