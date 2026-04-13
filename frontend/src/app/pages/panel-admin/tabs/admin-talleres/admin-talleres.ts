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

/**
 * Componente administrativo para la gestión integral de talleres.
 * Permite el control de catálogo, asignación de profesores y navegación a horarios e inscritos.
 */
@Component({
  selector: 'app-admin-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, FormTaller, Confirmacion, Notificacion],
  templateUrl: './admin-talleres.html',
  styleUrl: './admin-talleres.scss'
})
export class AdminTalleres implements OnInit {
  talleres: TallerResponse[] = []; // Listado maestro de talleres
  profesores: UsuarioResponse[] = []; // Listado de usuarios con rol de profesor
  busqueda: string = ''; // Término para el filtrado de la tabla
  criterioBusqueda: string = 'todos'; // Ámbito de búsqueda (nombre, profesor o ambos)
  mostrarModal: boolean = false; // Control de visibilidad del formulario dinámico
  tallerSeleccionado: TallerResponse | null = null; // Taller activo para edición o nulo para creación

  /**
   * @param tallerService Operaciones CRUD de talleres.
   * @param usuarioService Acceso a datos de usuarios y filtrado por rol.
   * @param notificacionService Gestión de feedback visual y confirmaciones.
   * @param cdr Detección de cambios manual para flujos asíncronos.
   * @param router Gestión de navegación hacia vistas de detalle.
   */
  constructor(
    private tallerService: TallerService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Inicializa los datos de talleres y profesores al cargar el componente.
   */
  ngOnInit(): void {
    this.cargarTalleres();
    this.cargarProfesores();
  }

  /**
   * Recupera la lista actualizada de talleres desde el servidor.
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
   * Recupera la lista de usuarios con rol de profesor para los selectores del formulario.
   */
  cargarProfesores(): void {
    this.usuarioService.listarPorRol(2).subscribe({
      next: (res) => {
        this.profesores = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Getter que aplica la lógica de filtrado sobre la colección de talleres.
   */
  get talleresFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) return this.talleres;

    return this.talleres.filter(t => {
      const nombreTaller = (t.nombre || '').toLowerCase();
      const nombreProfesor = (t.nombreCompletoProfesor || '').toLowerCase();

      switch (this.criterioBusqueda) {
        case 'nombre':
          return nombreTaller.includes(term);
        case 'profesor':
          return nombreProfesor.includes(term);
        default:
          return nombreTaller.includes(term) || nombreProfesor.includes(term);
      }
    });
  }

  /**
   * Genera el placeholder dinámico para el input de búsqueda según el criterio seleccionado.
   */
  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre': return 'Escribe el nombre del taller...';
      case 'profesor': return 'Escribe el nombre del profesor...';
      default: return 'Buscar por taller o profesor...';
    }
  }

  /**
   * Prepara el estado para la creación de un nuevo taller.
   */
  abrirCrear() {
    this.tallerSeleccionado = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Carga los datos de un taller existente para su edición.
   * @param t Taller seleccionado de la lista.
   */
  abrirEditar(t: TallerResponse) {
    this.tallerSeleccionado = JSON.parse(JSON.stringify(t));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  /**
   * Ejecuta la petición de guardado (creación o actualización) y gestiona la respuesta.
   * @param fd FormData con la información del taller y el archivo de imagen.
   */
  ejecutarGuardado(fd: FormData): void {
    const id = this.tallerSeleccionado?.idTaller;
    const peticion$ = id ? this.tallerService.actualizar(id, fd) : this.tallerService.crear(fd);

    peticion$.subscribe({
      next: () => {
        this.notificacionService.mostrar({ 
          titulo: 'Éxito', 
          mensaje: id ? 'Taller actualizado' : 'Taller creado', 
          tipo: 'exito' 
        });
        this.mostrarModal = false;
        this.cargarTalleres();
      }
    });
  }

  /**
   * Solicita confirmación y elimina un taller de forma permanente.
   * @param id Identificador único del taller.
   */
  eliminarTaller(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar taller?',
      mensaje: 'Esta acción es permanente.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.tallerService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Borrado', mensaje: 'Taller eliminado', tipo: 'exito' });
            this.cargarTalleres();
          }
        });
      }
    });
  }

  /**
   * Navega a la vista de inscritos para un taller específico.
   * @param idTaller Identificador del taller.
   */
  verInscritos(idTaller: number) {
    this.router.navigate(['/panel-admin/talleres', idTaller, 'inscripciones']);
  }

  /**
   * Navega a la vista de gestión de horarios para un taller específico.
   * @param id Identificador del taller.
   */
  verHorario(id: number) {
    this.router.navigate(['/panel-admin/talleres', id, 'horario']);
  }
}