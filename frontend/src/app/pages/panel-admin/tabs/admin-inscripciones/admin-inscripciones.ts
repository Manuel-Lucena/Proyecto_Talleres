import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InscripcionService } from '../../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { TallerService } from '../../../../services/Taller.Service';
import { InscripcionResponse } from '../../../../interfaces/Inscripcion.Interface';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { FormInscripcionAdmin } from '../../../../components/forms/form-inscripcion-admin/form-inscripcion-admin';
import { FormCargaInscripciones } from '../../../../components/forms/form-carga-inscripciones/form-carga-inscripciones';
import { PaginatePipe } from '../../../../pipes/PaginatePipe';

/**
 * COMPONENTE: GESTIÓN DE INSCRIPCIONES (ADMIN)
 * Panel administrativo polivalente. Adapta su interfaz para gestionar alumnos
 * por taller, o el historial de talleres por usuario (alumno/profesor).
 */
@Component({
  selector: 'app-admin-inscripciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Confirmacion,
    Notificacion,
    FormInscripcionAdmin,
    FormCargaInscripciones,
    PaginatePipe
  ],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {
  /** Referencia para cálculos de redondeo en la paginación del template */
  protected readonly Math = Math;

  // --- Propiedades de Datos ---
  inscripciones: InscripcionResponse[] = [];
  tallerContexto: any = null;
  usuarioContexto: any = null;

  // --- Control de Paginación ---
  paginaActual: number = 1;
  registrosPorPagina: number = 8;

  // --- Estado y Flags de Vista ---
  idTaller?: number;
  idUsuario?: number;
  esVistaTaller = false;
  esVistaProfesor = false;

  // --- UI y Feedback ---
  cargando = true;
  mostrarModal = false;
  mostrarModalMasivo = false;

  private _busqueda: string = '';
  /** Getter del término de búsqueda */
  get busqueda(): string {
    return this._busqueda;
  }
  /** Setter que normaliza la búsqueda y resetea el paginador */
  set busqueda(value: string) {
    this._busqueda = value;
    this.paginaActual = 1;
  }

  // --- NUEVO: Propiedad para el Filtro de Estado ---
  private _filtroEstado: string = 'todos';
  get filtroEstado(): string {
    return this._filtroEstado;
  }
  set filtroEstado(value: string) {
    this._filtroEstado = value;
    this.paginaActual = 1;
  }

  titulo = '';
  subtitulo = '';

  // --- Flags de procesos asíncronos ---
  descargandoLista = false;
  descargandoFacturaId: number | null = null;

  /**
   * @param route Inyección para capturar parámetros de URL (idTaller/idUsuario)
   * @param location Servicio de Angular para navegación histórica
   * @param inscripcionService Gestión de API para matrículas
   * @param tallerService Gestión de API para información de talleres
   * @param notificacionService Servicio global para modales y alertas
   * @param cdr Trigger manual para detección de cambios en procesos asíncronos
   */
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private inscripcionService: InscripcionService,
    private tallerService: TallerService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Inicializa el componente suscribiéndose a los parámetros de ruta.
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
   * Determina el flujo de carga según el contexto solicitado.
   * @param tipo El origen de la consulta ('taller' o 'usuario')
   * @param id El identificador único de la entidad
   */
  cargarDatos(tipo: 'taller' | 'usuario', id: number): void {
    this.cargando = true;
    this.esVistaProfesor = false;
    if (tipo === 'taller') {
      this.cargarInscripcionesPorTaller(id);
    } else {
      this.cargarActividadUsuario(id);
    }
  }

  /**
   * Recupera alumnos inscritos y define el taller en contexto.
   * @param id ID del taller a consultar */
  private cargarInscripcionesPorTaller(id: number): void {
    this.inscripcionService.listarPorTaller(id).subscribe({
      next: (res) => {
        this.inscripciones = res.data || [];
        this.usuarioContexto = null;
        this.tallerContexto = {
          idTaller: id,
          nombre: this.inscripciones.length > 0 ? this.inscripciones[0].nombreTaller : 'Taller',
          precio: this.inscripciones.length > 0 ? this.inscripciones[0].montoPagado : 0
        };
        this.finalizarProcesoCarga();
      },
      error: () => this.cargando = false
    });
  }

  /**
   * Busca inscripciones de alumno, si no hay, busca talleres como docente.
   * @param idUsuario ID del usuario para analizar su actividad */
  private cargarActividadUsuario(idUsuario: number): void {
    this.inscripcionService.listarPorUsuario(idUsuario).subscribe({
      next: (res) => {
        const data = res.data || [];
        if (data.length > 0) {
          this.inscripciones = data;
          this.completarContextoUsuario(idUsuario);
        } else {
          this.cargarTalleresImpartidos(idUsuario);
        }
      },
      error: () => this.cargarTalleresImpartidos(idUsuario)
    });
  }

  /**
   * Carga talleres asignados a un profesor y mapea la respuesta para la UI de inscripciones.
   * @param idUsuario ID del profesor */
  private cargarTalleresImpartidos(idUsuario: number): void {
    this.tallerService.listarPorProfesor(idUsuario).subscribe({
      next: (res) => {
        const talleres = res.data || [];
        if (talleres.length > 0) {
          this.esVistaProfesor = true;
          this.inscripciones = talleres.map(t => ({
            idInscripcion: 0,
            idTaller: t.idTaller,
            nombreTaller: t.nombre,
            emailUsuario: t.nombreCompletoProfesor || 'Docente',
            fechaInscripcion: t.fechaInicio,
            montoPagado: t.precio,
            estadoPago: 'DOCENCIA',
            activa: true
          })) as any;
        } else {
          this.inscripciones = [];
        }
        this.completarContextoUsuario(idUsuario);
      },
      error: () => {
        this.inscripciones = [];
        this.completarContextoUsuario(idUsuario);
        this.cargando = false;
      }
    });
  }

  /**
   * Finaliza la definición del contexto de usuario para la cabecera.
   * @param id ID del usuario */
  private completarContextoUsuario(id: number): void {
    this.tallerContexto = null;
    this.usuarioContexto = {
      idUsuario: id,
      email: this.inscripciones.length > 0 ? (this.esVistaProfesor ? 'Perfil Profesor' : this.inscripciones[0].emailUsuario) : 'Usuario'
    };
    this.finalizarProcesoCarga();
  }

  /** Refresca textos, ordena la lista y notifica fin de carga */
  private finalizarProcesoCarga(): void {
    this.ordenarInscripciones();
    this.configurarTextos();
    this.cargando = false;
    this.cdr.detectChanges();
  }

  /**
   * Ordena las inscripciones: Primero las activas (true) y luego las bajas (false).
   */
  private ordenarInscripciones(): void {
    if (!this.inscripciones) return;
    this.inscripciones.sort((a, b) => {
      if (a.activa === b.activa) return 0;
      return a.activa ? -1 : 1;
    });
  }

  /**
   * Filtra la colección basándose en el término de búsqueda, el filtro de estado y el contexto de vista.
   * @returns Array filtrado de inscripciones */
  get inscripcionesFiltradas(): InscripcionResponse[] {
    const term = this.busqueda?.toLowerCase().trim();

    return this.inscripciones.filter(ins => {

      const cumpleEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activa' && ins.activa) ||
        (this.filtroEstado === 'baja' && !ins.activa);

      if (!cumpleEstado) return false;

      if (!term) return true;

      return this.esVistaTaller
        ? ins.emailUsuario?.toLowerCase().includes(term)
        : ins.nombreTaller?.toLowerCase().includes(term);
    });
  }

  /** Configura los literales de la interfaz según el modo actual */
  configurarTextos(): void {
    if (this.esVistaTaller) {
      this.titulo = "Gestión de Alumnos";
      this.subtitulo = this.inscripciones.length > 0 ? `Inscritos en ${this.inscripciones[0].nombreTaller}` : "Lista de alumnos";
    } else {
      this.titulo = this.esVistaProfesor ? "Talleres Impartidos" : "Talleres del Usuario";
      this.subtitulo = this.inscripciones.length > 0 ? (this.esVistaProfesor ? `Cursos asignados al docente` : `Cursos de ${this.inscripciones[0].emailUsuario}`) : "Sin actividad registrada";
    }
  }

  // --- CRUD e Interacciones ---

  abrirInscripcion(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  /**
   * Procesa la creación de una inscripción desde el formulario administrativo.
   * @param datos Objeto con la información de la matrícula */
  guardarInscripcion(datos: any): void {
    this.inscripcionService.inscribir(datos).subscribe({
      next: () => {
        this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Registrado correctamente', tipo: 'exito' });
        this.cerrarModal();
        this.refrescarDatos();
      },
      error: (err) => {
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: err.error?.message || 'Error al inscribir', tipo: 'error' });
      }
    });
  }

  abrirInscripcionMasiva(): void {
    if (this.esVistaTaller && this.idTaller) this.mostrarModalMasivo = true;
  }

  cerrarModalMasivo(): void {
    this.mostrarModalMasivo = false;
  }

  onMasivoGuardado(): void {
    this.refrescarDatos();
  }

  /** Recarga los datos según el contexto activo */
  private refrescarDatos(): void {
    if (this.idTaller) this.cargarDatos('taller', this.idTaller);
    else if (this.idUsuario) this.cargarDatos('usuario', this.idUsuario);
  }

  // --- Exportación ---

  /**
   * Descarga el PDF de factura para una inscripción específica.
   * @param idInscripcion ID del registro de matrícula */
  descargarFactura(idInscripcion: number): void {
    if (idInscripcion === 0) return;
    this.descargandoFacturaId = idInscripcion;
    this.inscripcionService.descargarFactura(idInscripcion).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_${idInscripcion}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.descargandoFacturaId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.descargandoFacturaId = null;
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo generar la factura.', tipo: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  /** Exporta la lista de asistencia del taller actual en formato PDF */
  descargarLista(): void {
    if (!this.idTaller) return;
    this.descargandoLista = true;
    this.inscripcionService.descargarListaPdf(this.idTaller).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreTaller = this.tallerContexto?.nombre.replace(/\s+/g, '_') || 'Taller';
        a.download = `Lista_${nombreTaller}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.descargandoLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.descargandoLista = false;
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo generar la lista.', tipo: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  // --- Acciones de Tabla ---

  /**
   * Conmuta el estado de activación de una inscripción.
   * @param id ID de la inscripción a modificar */
  alternarEstado(id: number): void {
    if (id === 0) return;
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
   * Elimina un registro tras confirmación del administrador.
   * @param id ID de la inscripción a eliminar */
  eliminar(id: number): void {
    if (id === 0) {
      this.notificacionService.mostrar({ titulo: 'Aviso', mensaje: 'No se puede eliminar la autoría docente.', tipo: 'info' });
      return;
    }
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
            this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Inscripción eliminada', tipo: 'exito' });
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.notificacionService.mostrar({ titulo: 'Error', mensaje: err.error?.message || 'Error al eliminar', tipo: 'error' });
          }
        });
      }
    });
  }

  /** Navega a la pantalla anterior */
  volver(): void {
    this.location.back();
  }
}