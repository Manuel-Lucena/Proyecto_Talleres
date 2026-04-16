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
 * Componente de gestión administrativa para el control de usuarios.
 * Proporciona funcionalidades de listado, búsqueda avanzada, filtrado por roles,
 * alta masiva y gestión de estados (activo/inactivo).
 */
@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormAlumno, FormCargaUsuarios, Confirmacion, Notificacion],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {

  // --- Propiedades de Datos ---
  usuarios: UsuarioResponse[] = []; // Colección maestra de usuarios desde el backend

  // --- Estado de Filtros y Búsqueda ---
  busqueda: string = '';           // Texto introducido en el buscador
  filtroRol: string = '';          // Rol seleccionado (ADMIN, PROFESOR, ALUMNO o vacío)
  criterioBusqueda: string = 'todos'; // Selector de campo (nombre, dni, email)

  // --- Gestión de UI y Modales ---
  mostrarModal: boolean = false;         // Control de visibilidad del formulario de usuario
  mostrarModalCarga: boolean = false;    // Control de visibilidad para carga masiva
  usuarioSeleccionado: UsuarioResponse | null = null; // Buffer para edición

  /**
   * @param usuarioService Operaciones de comunicación con la API de usuarios.
   * @param notificacionService Servicio para lanzar diálogos de confirmación y alertas.
   * @param router Gestión de rutas para navegación interna.
   * @param cdr Forzado de detección de cambios para procesos asíncronos complejos.
   */
  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Carga la lista inicial de usuarios al montar el componente.
   */
  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /**
   * Solicita al servidor el listado completo de usuarios.
   */
  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (res) => {
        this.usuarios = [...res.data];
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE FILTRADO DINÁMICO ---
  // ===========================================================================

  /**
   * Getter reactivo que devuelve la lista de usuarios procesada.
   * Se ejecuta automáticamente cuando cambian los inputs de búsqueda o filtros.
   */
  get usuariosFiltrados() {
    const term = this.busqueda.toLowerCase().trim();

    return this.usuarios.filter(u => {
      // 1. Filtro por Rol
      const cumpleRol = this.filtroRol === '' || u.nombreRol === this.filtroRol;
      if (!cumpleRol) return false;

      // 2. Filtro por Término de Búsqueda
      if (!term) return true;

      switch (this.criterioBusqueda) {
        case 'nombre': 
          return (u.nombre + ' ' + u.apellidos).toLowerCase().includes(term);
        case 'dni': 
          return u.dni.toLowerCase().includes(term);
        case 'email': 
          return u.email.toLowerCase().includes(term);
        default: // Búsqueda global en todos los campos
          return (u.nombre + u.apellidos + u.dni + u.email).toLowerCase().includes(term);
      }
    });
  }

  /**
   * Ajusta el placeholder del buscador según el criterio de filtrado seleccionado.
   */
  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre': return 'Buscar por nombre...';
      case 'dni': return 'Buscar por DNI...';
      case 'email': return 'Buscar por correo...';
      default: return 'Búsqueda general...';
    }
  }

  // ===========================================================================
  // --- OPERACIONES DE GESTIÓN (CRUD) ---
  // ===========================================================================

  /**
   * Inicializa el flujo para crear un nuevo usuario.
   */
  abrirCrear() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  /**
   * Prepara el formulario para editar un usuario existente.
   * @param u El usuario cargado desde la fila de la tabla.
   */
  abrirEditar(u: UsuarioResponse) {
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(u));
    this.mostrarModal = true;
  }

  /**
   * Procesa la persistencia de datos (Creación o Actualización).
   * @param fd FormData que contiene el DTO del usuario y la imagen opcional.
   */
  ejecutarGuardado(fd: FormData): void {
    const esEdicion = !!this.usuarioSeleccionado;
    
    // Selección dinámica de la petición según el contexto
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
   * Realiza un "soft delete" o reactivación cambiando el flag 'activo' del usuario.
   * @param u Usuario a modificar.
   */
  toggleEstado(u: UsuarioResponse) {
    this.notificacionService.confirmar({
      titulo: u.activo ? 'Dar de baja' : 'Reactivar',
      mensaje: `¿Deseas cambiar el estado de ${u.nombre}?`,
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
   * Ejecuta la eliminación definitiva de un registro en la base de datos.
   * @param id ID único del usuario.
   */
  eliminarUsuario(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar?',
      mensaje: 'Esta acción es irreversible y eliminará todos los datos asociados.',
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
   * Redirige a la vista detallada de inscripciones del usuario seleccionado.
   */
  verInscripciones(idUsuario: number) {
    this.router.navigate(['/panel-admin/usuarios', idUsuario, 'inscripciones']);
  }
}