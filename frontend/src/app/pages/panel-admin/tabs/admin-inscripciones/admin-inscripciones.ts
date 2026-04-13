import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InscripcionService } from '../../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { InscripcionResponse } from '../../../../interfaces/Inscripcion.Interface';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { FormInscripcionAdmin } from '../../../../components/forms/form-inscripcion-admin/form-inscripcion-admin';

/**
 * Componente administrativo para la gestión de inscripciones.
 * Soporta vistas contextuales: inscritos por taller o talleres por usuario.
 */
@Component({
  selector: 'app-admin-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, Confirmacion, Notificacion, FormInscripcionAdmin],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {
  inscripciones: InscripcionResponse[] = []; // Listado de inscripciones recuperadas
  cargando = true; // Estado de carga de la petición de datos
  mostrarModal = false; // Control de visibilidad para el formulario de inscripción
  busqueda: string = ''; // Término para el filtrado dinámico en la tabla

  tallerContexto: any = null; // Información resumida del taller si la vista es por taller
  usuarioContexto: any = null; // Información resumida del usuario si la vista es por usuario

  idTaller?: number; // Identificador del taller extraído de la URL
  idUsuario?: number; // Identificador del usuario extraído de la URL
  esVistaTaller = false; // Flag para determinar el modo de visualización

  titulo = ''; // Título dinámico del encabezado
  subtitulo = ''; // Subtítulo dinámico del encabezado

  /**
   * @param route Servicio para acceder a los parámetros de la ruta activa.
   * @param location Servicio para gestionar la navegación hacia atrás en el historial.
   * @param inscripcionService Operaciones de persistencia y consulta de inscripciones.
   * @param notificacionService Gestión de alertas y diálogos de confirmación.
   * @param cdr Detección de cambios manual para actualizaciones asíncronas.
   */
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private inscripcionService: InscripcionService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Identifica el contexto de la vista (taller o usuario) mediante los parámetros de la URL.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['idTaller']) {
        this.idTaller = Number(params['idTaller']);
        this.esVistaTaller = true;
        this.cargarDatos('taller', this.idTaller);
      } else if (params['idUsuario']) {
        this.idUsuario = Number(params['idUsuario']);
        this.esVistaTaller = false;
        this.cargarDatos('usuario', this.idUsuario);
      }
    });
  }

  /**
   * Carga la lista de inscripciones y configura el objeto de contexto correspondiente.
   * @param tipo Discriminador entre taller o usuario.
   * @param id Identificador único de la entidad.
   */
  cargarDatos(tipo: 'taller' | 'usuario', id: number) {
    this.cargando = true;
    const peticion = tipo === 'taller'
      ? this.inscripcionService.listarPorTaller(id)
      : this.inscripcionService.listarPorUsuario(id);

    peticion.subscribe({
      next: (res) => {
        this.inscripciones = res.data || [];

        if (tipo === 'taller') {
          this.usuarioContexto = null;
          this.tallerContexto = {
            idTaller: id,
            nombre: this.inscripciones.length > 0 ? this.inscripciones[0].nombreTaller : 'Taller',
            precio: this.inscripciones.length > 0 ? this.inscripciones[0].montoPagado : 0
          };
        } else {
          this.tallerContexto = null;
          this.usuarioContexto = {
            idUsuario: id,
            email: this.inscripciones.length > 0 ? this.inscripciones[0].emailUsuario : 'Usuario'
          };
        }

        this.configurarTextos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => this.cargando = false
    });
  }

  /**
   * Getter que filtra las inscripciones basándose en el email del usuario o nombre del taller.
   */
  get inscripcionesFiltradas() {
    const term = this.busqueda?.toLowerCase().trim();
    if (!term) return this.inscripciones;

    return this.inscripciones.filter(ins => {
      if (this.esVistaTaller) {
        return ins.emailUsuario?.toLowerCase().includes(term);
      } else {
        return ins.nombreTaller?.toLowerCase().includes(term);
      }
    });
  }

  /**
   * Ajusta los textos de la interfaz según el contexto actual de navegación.
   */
  configurarTextos() {
    if (this.esVistaTaller) {
      this.titulo = "Gestión de Alumnos";
      this.subtitulo = this.inscripciones.length > 0
        ? `Inscritos en ${this.inscripciones[0].nombreTaller}`
        : "Lista de alumnos";
    } else {
      this.titulo = "Talleres del Usuario";
      this.subtitulo = this.inscripciones.length > 0
        ? `Cursos de ${this.inscripciones[0].emailUsuario}`
        : "Inscripciones del usuario";
    }
  }

  /**
   * Muestra el modal para realizar una nueva inscripción administrativa.
   */
  abrirInscripcion() {
    this.mostrarModal = true;
  }

  /**
   * Oculta el modal de inscripción.
   */
  cerrarModal() {
    this.mostrarModal = false;
  }

  /**
   * Envía los datos de una nueva inscripción al servidor y refresca la lista.
   * @param datos DTO con la información de inscripción y pago.
   */
  guardarInscripcion(datos: any) {
    this.inscripcionService.inscribir(datos).subscribe({
      next: () => {
        this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Registrado correctamente', tipo: 'exito' });
        this.cerrarModal();
        if (this.idTaller) this.cargarDatos('taller', this.idTaller);
        else if (this.idUsuario) this.cargarDatos('usuario', this.idUsuario);
      },
      error: (err) => {
        this.notificacionService.mostrar({ 
          titulo: 'Error', 
          mensaje: err.error?.message || 'Error al inscribir', 
          tipo: 'error' 
        });
      }
    });
  }

  /**
   * Cambia el estado de activación de una inscripción específica.
   * @param id Identificador único de la inscripción.
   */
  alternarEstado(id: number) {
    this.inscripcionService.cambiarEstado(id).subscribe({
      next: (res) => {
        const index = this.inscripciones.findIndex(i => i.idInscripcion === id);
        if (index !== -1) {
          this.inscripciones[index].activa = res.data.activa;
          this.cdr.detectChanges();
        }
      }
    });
  }

  /**
   * Solicita confirmación y elimina un registro de inscripción de forma permanente.
   * @param id Identificador único de la inscripción.
   */
  eliminar(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar inscripción?',
      mensaje: 'Esta acción borrará el registro de forma permanente.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then(confirmado => {
      if (confirmado) {
        this.inscripcionService.eliminar(id).subscribe({
          next: () => {
            this.inscripciones = this.inscripciones.filter(i => i.idInscripcion !== id);
            this.notificacionService.mostrar({
              titulo: 'Inscripción eliminada',
              mensaje: 'El registro ha sido borrado correctamente.',
              tipo: 'exito'
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.notificacionService.mostrar({
              titulo: 'Error',
              mensaje: err.error?.message || 'No se pudo eliminar la inscripción',
              tipo: 'error'
            });
          }
        });
      }
    });
  }

  /**
   * Regresa a la página anterior utilizando el historial del navegador.
   */
  volver() {
    this.location.back();
  }
}