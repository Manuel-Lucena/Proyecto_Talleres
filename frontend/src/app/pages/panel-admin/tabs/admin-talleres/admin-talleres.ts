import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../../services/Taller.Service';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { TallerResponse } from '../../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
import { FormTaller } from '../../../../components/forms/form-taller/form-taller';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Router } from '@angular/router';
import { PaginatePipe } from '../../../../pipes/PaginatePipe';

/**
 * Componente administrativo para la gestión integral del catálogo de talleres.
 * Centraliza las funciones de creación, edición, borrado y asignación de personal docente,
 * además de servir como punto de acceso a la gestión de horarios e inscripciones.
 */
@Component({
  selector: 'app-admin-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, FormTaller, Confirmacion, Notificacion, PaginatePipe], 
  templateUrl: './admin-talleres.html',
  styleUrl: './admin-talleres.scss'
})
export class AdminTalleres implements OnInit {
  /** Utilidad para que el HTML pueda usar funciones matemáticas en la paginación */
  protected readonly Math = Math;

  // --- Colecciones de Datos ---
  talleres: TallerResponse[] = [];     // Listado maestro de talleres obtenidos del servidor
  profesores: UsuarioResponse[] = [];   // Usuarios con rol de profesor (ID: 2) para el select

  // --- Control de Paginación ---
  /** Página actual del listado */
  paginaActual: number = 1;
  /** Cantidad de registros visibles por página */
  registrosPorPagina: number = 5;

  // --- Estado de Búsqueda y Filtros ---
  /** Texto reactivo del input de búsqueda con reset de página */
  private _busqueda: string = '';
  get busqueda(): string { return this._busqueda; }
  set busqueda(value: string) {
    this._busqueda = value;
    this.paginaActual = 1;
  }

  criterioBusqueda: string = 'todos';    // Ámbito: 'nombre', 'profesor' o 'todos'

  // --- Control de Interfaz (Modales) ---
  mostrarModal: boolean = false;           // Estado de visibilidad del modal CRUD
  tallerSeleccionado: TallerResponse | null = null; // Buffer para edición/creación

  /**
   * @param tallerService Servicios de persistencia de talleres.
   * @param usuarioService Necesario para cargar el listado de profesores disponibles.
   * @param notificacionService Feedback visual y diálogos de sistema.
   * @param cdr Forzado de detección de cambios.
   * @param router Navegación a sub-vistas (Horarios/Inscripciones).
   */
  constructor(
    private tallerService: TallerService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Ciclo de vida: Inicializa los datos necesarios para poblar la tabla y los formularios.
   */
  ngOnInit(): void {
    this.cargarTalleres();
    this.cargarProfesores();
  }

  // ===========================================================================
  // --- CARGA DE DATOS ---
  // ===========================================================================

  /**
   * Recupera todos los talleres registrados en el sistema.
   */
  cargarTalleres(): void {
    this.tallerService.listarTodos().subscribe({
      next: (res) => {
        this.talleres = [...res.data]; 
        this.cdr.detectChanges();
      },
      error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudieron cargar los talleres', tipo: 'error' })
    });
  }

  /**
   * Obtiene exclusivamente los usuarios con Rol de Profesor.
   * Se utiliza para alimentar el desplegable de asignación en el formulario de taller.
   */
  cargarProfesores(): void {
    this.usuarioService.listarPorRol(2).subscribe({
      next: (res) => {
        this.profesores = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE FILTRADO ---
  // ===========================================================================

  /**
   * Getter que procesa la colección de talleres según los inputs de la UI.
   * Filtra por nombre de taller o nombre del profesor asignado.
   */
  get talleresFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) return this.talleres;
    return this.talleres.filter(t => {
      const nombreTaller = (t.nombre || '').toLowerCase();
      const nombreProfesor = (t.nombreCompletoProfesor || '').toLowerCase();
      switch (this.criterioBusqueda) {
        case 'nombre':   return nombreTaller.includes(term);
        case 'profesor': return nombreProfesor.includes(term);
        default:         return nombreTaller.includes(term) || nombreProfesor.includes(term);
      }
    });
  }

  /**
   * Ajusta el mensaje de ayuda del buscador basándose en el criterio activo.
   */
  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre':   return 'Escribe el nombre del taller...';
      case 'profesor': return 'Escribe el nombre del profesor...';
      default:         return 'Buscar por taller o profesor...';
    }
  }

  // ===========================================================================
  // --- OPERACIONES DE GESTIÓN (CRUD) ---
  // ===========================================================================

  /**
   * Prepara el entorno para el registro de un nuevo taller.
   */
  abrirCrear() {
    this.tallerSeleccionado = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Prepara la edición cargando una copia profunda del taller para evitar
   * mutaciones accidentales en la lista de la tabla.
   */
  abrirEditar(t: TallerResponse) {
    this.tallerSeleccionado = JSON.parse(JSON.stringify(t));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Canaliza la información hacia el servicio correspondiente (Creación o Actualización).
   * @param fd FormData con los datos binarios y el DTO del taller.
   */
  ejecutarGuardado(fd: FormData): void {
    const id = this.tallerSeleccionado?.idTaller;
    const peticion$ = id ? this.tallerService.actualizar(id, fd) : this.tallerService.crear(fd);
    peticion$.subscribe({
      next: () => {
        this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: id ? 'Taller actualizado correctamente' : 'Taller creado con éxito', tipo: 'exito' });
        this.mostrarModal = false;
        this.cargarTalleres();
      }
    });
  }

  /**
   * Solicita confirmación y ejecuta el borrado físico del taller.
   * @param id Identificador único del taller.
   */
  eliminarTaller(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar taller?',
      mensaje: 'Esta acción eliminará el taller y sus asociaciones. Es irreversible.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.tallerService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Borrado', mensaje: 'Taller eliminado del sistema', tipo: 'exito' });
            this.cargarTalleres();
          }
        });
      }
    });
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Redirige al panel detallado de alumnos inscritos en el taller.
   */
  verInscritos(idTaller: number) {
    this.router.navigate(['/panel-admin/talleres', idTaller, 'inscripciones']);
  }

  /**
   * Redirige a la gestión de turnos y franjas horarias del taller.
   */
  verHorario(id: number) {
    this.router.navigate(['/panel-admin/talleres', id, 'horario']);
  }
}