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

/**
 * Componente para la gestión administrativa de usuarios.
 * Permite listar, filtrar, crear, editar, eliminar y gestionar el estado de los usuarios.
 */
@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormAlumno, FormCargaUsuarios, Confirmacion, Notificacion],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  usuarios: UsuarioResponse[] = []; // Listado completo de usuarios
  busqueda: string = ''; // Término de búsqueda actual
  filtroRol: string = ''; // Rol seleccionado para filtrar
  criterioBusqueda: string = 'todos'; // Campo por el cual filtrar (nombre, dni, email)

  mostrarModal: boolean = false; // Control del modal de creación/edición
  mostrarModalCarga: boolean = false; // Control del modal de carga masiva
  usuarioSeleccionado: UsuarioResponse | null = null; // Usuario activo para edición

  /**
   * @param usuarioService Operaciones de persistencia de usuarios.
   * @param notificacionService Gestión de diálogos y alertas globales.
   * @param router Servicio de navegación para acceso a inscripciones.
   * @param cdr Detección manual de cambios para actualizaciones asíncronas.
   */
  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el listado de usuarios al cargar el componente.
   */
  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /**
   * Obtiene la colección actualizada de usuarios desde el servidor.
   */
  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (res) => {
        this.usuarios = [...res.data];
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Getter que aplica los filtros de búsqueda y rol sobre la lista de usuarios.
   */
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

  /**
   * Genera el texto de sugerencia para el buscador según el criterio.
   */
  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre': return 'Buscar por nombre...';
      case 'dni': return 'Buscar por DNI...';
      case 'email': return 'Buscar por correo...';
      default: return 'Búsqueda general...';
    }
  }

  /**
   * Prepara el estado para la creación de un nuevo usuario.
   */
  abrirCrear() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  /**
   * Carga un usuario en el modal para su edición.
   * @param u Usuario seleccionado.
   */
  abrirEditar(u: UsuarioResponse) {
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(u));
    this.mostrarModal = true;
  }

  /**
   * Procesa el guardado de datos (creación o edición) y gestiona la respuesta.
   * @param fd FormData con el DTO del usuario y posible archivo de imagen.
   */
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
        const mensajeError = err.error?.mensaje || 'No se pudo completar la operación.';
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: mensajeError, tipo: 'error' });
      }
    });
  }

  /**
   * Alterna el estado activo/inactivo de un usuario previa confirmación.
   * @param u Usuario a modificar.
   */
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

  /**
   * Solicita confirmación y elimina un usuario de forma definitiva.
   * @param id Identificador único del usuario.
   */
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

  /**
   * Navega a la vista de inscripciones detallada de un usuario.
   * @param idUsuario Identificador del usuario.
   */
  verInscripciones(idUsuario: number) {
    this.router.navigate(['/panel-admin/usuarios', idUsuario, 'inscripciones']);
  }
}