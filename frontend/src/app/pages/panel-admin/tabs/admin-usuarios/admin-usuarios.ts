import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { PaginatePipe } from '../../../../pipes/PaginatePipe';

/**
 * Componente de gestión administrativa para el control de usuarios.
 * Proporciona funcionalidades de listado, búsqueda avanzada, filtrado por roles,
 * alta masiva y gestión de estados (activo/inactivo).
 */
@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormAlumno, FormCargaUsuarios, Confirmacion, Notificacion, PaginatePipe],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  // --- Referencias de Componentes ---
  /** Referencia al formulario hijo para gestionar validaciones manuales desde el servidor */
  @ViewChild(FormAlumno) formAlumno!: FormAlumno;
  /** Utilidad para que el HTML pueda usar funciones matemáticas en la paginación */
  protected readonly Math = Math;

  // --- Propiedades de Datos ---
  /** Colección maestra de usuarios obtenida desde el backend */
  usuarios: UsuarioResponse[] = [];

  // --- Control de Paginación ---
  /** Página actual del listado */
  paginaActual: number = 1;
  /** Cantidad de registros visibles por página */
  registrosPorPagina: number = 7;

  // --- Estado de Filtros y Búsqueda ---
  /** Texto introducido por el usuario en el campo de búsqueda */
  private _busqueda: string = '';
  get busqueda(): string { return this._busqueda; }
  set busqueda(value: string) {
    this._busqueda = value;
    this.paginaActual = 1; // Resetea a la primera página al realizar una nueva búsqueda
  }

  /** Rol seleccionado para el filtrado (ADMIN, PROFESOR, ALUMNO o vacío) */
  private _filtroRol: string = '';
  get filtroRol(): string { return this._filtroRol; }
  set filtroRol(value: string) {
    this._filtroRol = value;
    this.paginaActual = 1; // Resetea a la primera página al cambiar el filtro de rol
  }

  /** Estado seleccionado para el filtrado (todos, activo o inactivo) */
  private _filtroEstado: string = 'todos';
  get filtroEstado(): string { return this._filtroEstado; }
  set filtroEstado(value: string) {
    this._filtroEstado = value;
    this.paginaActual = 1; // Resetea a la primera página al cambiar el filtro de estado
  }

  /** Selector del campo por el cual realizar la búsqueda (nombre, dni, email o todos) */
  criterioBusqueda: string = 'todos';

  // --- Gestión de UI y Modales ---
  /** Control de visibilidad para el modal del formulario de usuario (crear/editar) */
  mostrarModal: boolean = false;
  /** Control de visibilidad para el modal de carga masiva de archivos */
  mostrarModalCarga: boolean = false;
  /** Almacena los datos del usuario seleccionado para su edición; null para creación */
  usuarioSeleccionado: UsuarioResponse | null = null;

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
   * Ciclo de vida: Inicializa el componente cargando el listado completo de usuarios.
   */
  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /**
   * Solicita al servidor el listado completo de usuarios.
   * Se aplica normalización de datos para convertir el estado del backend (0/1 o string)
   * en un valor booleano nativo de JavaScript para el correcto funcionamiento de la UI.
   */
  cargarUsuarios(): void {
    this.usuarioService.listarAlumnosAdmin().subscribe({
      next: (res) => {
        this.usuarios = res.data.map((u: any) => ({
          ...u,
       
          activo: u.activo === 1 || u.activo === true || u.activo === 'true' || u.activo === '1'
        })).sort((a: any, b: any) => {
    
          if (a.activo === b.activo) return a.nombre.localeCompare(b.nombre);
          return a.activo ? -1 : 1;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  // ===========================================================================
  // --- LÓGICA DE FILTRADO DINÁMICO ---
  // ===========================================================================

  /**
   * Getter reactivo que devuelve la lista de usuarios procesada según los filtros de búsqueda, rol y estado.
   * @returns {UsuarioResponse[]} Lista filtrada de usuarios.
   */
  get usuariosFiltrados(): UsuarioResponse[] {
    const term = this.busqueda.toLowerCase().trim();
    return this.usuarios.filter(u => {
      const cumpleRol = this.filtroRol === '' || u.nombreRol === this.filtroRol;
      if (!cumpleRol) return false;

      const cumpleEstado = this.filtroEstado === 'todos' || (this.filtroEstado === 'activo' && u.activo) || (this.filtroEstado === 'inactivo' && !u.activo);
      if (!cumpleEstado) return false;

      if (!term) return true;

      switch (this.criterioBusqueda) {
        case 'nombre': return (u.nombre + ' ' + u.apellidos).toLowerCase().includes(term);
        case 'dni': return u.dni.toLowerCase().includes(term);
        case 'email': return u.email.toLowerCase().includes(term);
        default: return (u.nombre + ' ' + u.apellidos + u.dni + u.email).toLowerCase().includes(term);
      }
    });
  }

  /**
   * Define el texto de ayuda del input de búsqueda según el criterio seleccionado.
   * @returns {string} Texto para el atributo placeholder.
   */
  getPlaceholder(): string {
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
   * Prepara el estado para la creación de un nuevo usuario abriendo el modal correspondiente.
   */
  abrirCrear(): void {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  /**
   * Carga los datos de un usuario en el buffer de edición y abre el modal.
   * @param {UsuarioResponse} u Usuario a editar.
   */
  abrirEditar(u: UsuarioResponse): void {
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(u));
    this.mostrarModal = true;
  }

  /**
   * Procesa el guardado de datos (creación o actualización) enviando el FormData al servicio.
   * @param {FormData} fd Objeto FormData que contiene los datos del usuario y opcionalmente la foto.
   */
  ejecutarGuardado(fd: FormData): void {
    const esEdicion = !!this.usuarioSeleccionado;
    const peticion$ = (esEdicion ? this.usuarioService.actualizarUsuario(this.usuarioSeleccionado!.idUsuario, fd) : this.usuarioService.crearUsuario(fd)) as import('rxjs').Observable<any>;
    peticion$.subscribe({
      next: (res: any) => {
        this.notificacionService.mostrar({
          titulo: 'Éxito',
          mensaje: esEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado con éxito',
          tipo: 'exito'
        });
        this.mostrarModal = false;

        if (esEdicion) {
          const index = this.usuarios.findIndex(u => u.idUsuario === this.usuarioSeleccionado?.idUsuario);
          if (index !== -1) {
            this.usuarios[index] = { ...this.usuarios[index], ...res.data };
          }
        } else {
          this.cargarUsuarios();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.mensaje || "";
        if (msg.toLowerCase().includes('email')) {
          this.formAlumno.form.get('email')?.setErrors({ repetido: 'Este email ya está registrado' });
          this.formAlumno.form.get('email')?.markAsTouched();
        }
        if (msg.toLowerCase().includes('dni') || msg.toLowerCase().includes('identificación')) {
          this.formAlumno.form.get('dni')?.setErrors({ repetido: 'Este DNI ya está registrado' });
          this.formAlumno.form.get('dni')?.markAsTouched();
        }
        if (!msg.toLowerCase().includes('email') && !msg.toLowerCase().includes('dni') && !msg.toLowerCase().includes('identificación')) {
          const mensajeError = msg || 'No se pudo completar la operación.';
          this.notificacionService.mostrar({ titulo: 'Error', mensaje: mensajeError, tipo: 'error' });
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de actividad de un usuario.
   * @param {UsuarioResponse} u Usuario al que se le desea cambiar el estado.
   * @note Realiza una actualización parcial enviando un DTO con el nuevo estado.
   */
  toggleEstado(u: UsuarioResponse): void {
    this.notificacionService.confirmar({
      titulo: u.activo ? 'Dar de baja' : 'Reactivar',
      mensaje: `¿Deseas cambiar el estado de ${u.nombre}?`,
    }).then((confirmado) => {
      if (confirmado) {
        const nuevoEstado = !u.activo;
        const idRolCalculado = (u as any).idRol || (u.nombreRol === 'ADMIN' ? 1 : u.nombreRol === 'PROFESOR' ? 2 : 3);
        const dto = { dni: u.dni, nombre: u.nombre, apellidos: u.apellidos, email: u.email, direccion: u.direccion, telefono: u.telefono, activo: nuevoEstado, idRol: idRolCalculado };
        const fd = new FormData();
        fd.append('usuario', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        this.usuarioService.actualizarUsuario(u.idUsuario, fd).subscribe({
          next: () => {
            u.activo = nuevoEstado;
            this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Estado actualizado correctamente', tipo: 'exito' });
            this.cdr.detectChanges();
          },
          error: (err) => {
            const mensajeServer = err.error?.message || err.error?.mensaje || 'No se pudo actualizar el estado.';
            this.notificacionService.mostrar({ titulo: 'Acción denegada', mensaje: mensajeServer, tipo: 'error' });
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  /**
   * Elimina un usuario del sistema tras confirmación.
   * @param {number} id Identificador único del usuario.
   */
  eliminarUsuario(id: number): void {
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
   * Navega a la vista detallada de inscripciones de un usuario específico.
   * @param {number} idUsuario Identificador del usuario.
   */
  verInscripciones(idUsuario: number): void {
    this.router.navigate(['/panel-admin/usuarios', idUsuario, 'inscripciones']);
  }
}