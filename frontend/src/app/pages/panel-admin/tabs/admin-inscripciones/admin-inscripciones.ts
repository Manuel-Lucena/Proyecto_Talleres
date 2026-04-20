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

/**
 * Componente administrativo polivalente para la gestión de inscripciones.
 * Funciona en tres modos:
 * 1. Vista de Taller: Muestra todos los alumnos inscritos en un taller específico.
 * 2. Vista de Usuario (Alumno): Muestra todos los talleres en los que participa.
 * 3. Vista de Usuario (Profesor): Muestra los talleres que el usuario imparte.
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
    FormCargaInscripciones
  ],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {
  // --- Propiedades de Datos y Colecciones ---
  inscripciones: InscripcionResponse[] = []; // Listado de registros (Inscripciones o Talleres impartidos)
  tallerContexto: any = null;                // Datos del taller (vista taller)
  usuarioContexto: any = null;               // Datos del usuario (vista usuario)

  // --- Estado de la Ruta y Parámetros ---
  idTaller?: number;
  idUsuario?: number;
  esVistaTaller = false;
  esVistaProfesor = false;                   // Flag para identificar si listamos autoría en lugar de matrícula

  // --- UI, Mensajes y Modales ---
  cargando = true;
  mostrarModal = false;
  mostrarModalMasivo = false;
  busqueda: string = '';
  titulo = '';
  subtitulo = '';

  // --- Flags de Procesos de Descarga ---
  descargandoLista = false;
  descargandoFacturaId: number | null = null;

  /**
   * @param route Captura parámetros de la URL padre (idTaller o idUsuario).
   * @param location Permite la navegación hacia atrás en el historial.
   * @param inscripcionService Servicio para gestionar las matrículas de alumnos.
   * @param tallerService Servicio para gestionar los talleres y sus profesores.
   * @param notificacionService Puente para diálogos de confirmación y alertas.
   * @param cdr Forzado de detección de cambios para actualizaciones asíncronas.
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
   * Inicialización: Determina el contexto de trabajo analizando la URL activa.
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
   * Recupera la información desde el servidor basándose en el tipo de contexto.
   * @param tipo Identifica si buscamos por 'taller' o por 'usuario'.
   * @param id Identificador único correspondiente.
   */
  cargarDatos(tipo: 'taller' | 'usuario', id: number) {
    this.cargando = true;
    this.esVistaProfesor = false;

    if (tipo === 'taller') {
      this.cargarInscripcionesPorTaller(id);
    } else {
      this.cargarActividadUsuario(id);
    }
  }

  /**
   * Carga los alumnos inscritos en un taller específico.
   */
  private cargarInscripcionesPorTaller(id: number) {
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
   * Lógica híbrida para usuarios: Primero busca si es Alumno, si no, busca si es Profesor.
   * @param idUsuario ID del usuario a consultar.
   */
  private cargarActividadUsuario(idUsuario: number) {
    // 1. Intentamos cargar como Alumno (inscripciones)
    this.inscripcionService.listarPorUsuario(idUsuario).subscribe({
      next: (res) => {
        const data = res.data || [];
        if (data.length > 0) {
          this.inscripciones = data;
          this.completarContextoUsuario(idUsuario);
        } else {
          // 2. Si no tiene inscripciones, buscamos como Profesor
          this.cargarTalleresImpartidos(idUsuario);
        }
      },
      error: () => this.cargarTalleresImpartidos(idUsuario)
    });
  }

  /**
   * Consulta los talleres a cargo de un profesor usando el nuevo método del TallerService.
   * Mapea los resultados para que la tabla sea compatible.
   */
  private cargarTalleresImpartidos(idUsuario: number) {
    this.tallerService.listarPorProfesor(idUsuario).subscribe({
      next: (res) => {
        const talleres = res.data || [];
        if (talleres.length > 0) {
          this.esVistaProfesor = true;
          // Adaptamos TallerResponse a InscripcionResponse para no romper la UI
          this.inscripciones = talleres.map(t => ({
            idInscripcion: 0, // Flag para deshabilitar facturas y eliminar
            idTaller: t.idTaller,
            nombreTaller: t.nombre,
            emailUsuario: t.nombreCompletoProfesor || 'Docente',
            fechaInscripcion: t.fechaInicio,
            montoPagado: t.precio,
            estadoPago: 'DOCENCIA', // Texto distintivo para la tabla
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
   * Finaliza la configuración del contexto de usuario para la cabecera.
   */
  private completarContextoUsuario(id: number) {
    this.tallerContexto = null;
    this.usuarioContexto = {
      idUsuario: id,
      email: this.inscripciones.length > 0 ? (this.esVistaProfesor ? 'Perfil Profesor' : this.inscripciones[0].emailUsuario) : 'Usuario'
    };
    this.finalizarProcesoCarga();
  }

  /**
   * Cierra el estado de carga y refresca la UI.
   */
  private finalizarProcesoCarga() {
    this.configurarTextos();
    this.cargando = false;
    this.cdr.detectChanges();
  }

  /**
   * Getter que filtra la tabla dinámicamente según el contexto.
   */
  get inscripcionesFiltradas() {
    const term = this.busqueda?.toLowerCase().trim();
    if (!term) return this.inscripciones;
    return this.inscripciones.filter(ins => {
      return this.esVistaTaller ? ins.emailUsuario?.toLowerCase().includes(term) : ins.nombreTaller?.toLowerCase().includes(term);
    });
  }

  /**
   * Ajusta los títulos de la interfaz para que el administrador sepa qué está gestionando.
   */
  configurarTextos() {
    if (this.esVistaTaller) {
      this.titulo = "Gestión de Alumnos";
      this.subtitulo = this.inscripciones.length > 0 ? `Inscritos en ${this.inscripciones[0].nombreTaller}` : "Lista de alumnos";
    } else {
      this.titulo = this.esVistaProfesor ? "Talleres Impartidos" : "Talleres del Usuario";
      this.subtitulo = this.inscripciones.length > 0 ? (this.esVistaProfesor ? `Cursos asignados al docente` : `Cursos de ${this.inscripciones[0].emailUsuario}`) : "Sin actividad registrada";
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE INSCRIPCIONES (MODALES) ---
  // ===========================================================================
  abrirInscripcion() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarInscripcion(datos: any) {
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

  abrirInscripcionMasiva() {
    if (this.esVistaTaller && this.idTaller) this.mostrarModalMasivo = true;
  }

  cerrarModalMasivo() {
    this.mostrarModalMasivo = false;
  }

  onMasivoGuardado() {
    this.refrescarDatos();
  }

  private refrescarDatos() {
    if (this.idTaller) this.cargarDatos('taller', this.idTaller);
    else if (this.idUsuario) this.cargarDatos('usuario', this.idUsuario);
  }

  // ===========================================================================
  // --- DESCARGAS Y EXPORTACIÓN ---
  // ===========================================================================
  descargarFactura(idInscripcion: number) {
    if (idInscripcion === 0) return; // No hay factura para autoría de profesor
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

  descargarLista() {
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

  // ===========================================================================
  // --- ACCIONES DE TABLA ---
  // ===========================================================================
  alternarEstado(id: number) {
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

  eliminar(id: number) {
    if (id === 0) {
      this.notificacionService.mostrar({ titulo: 'Aviso', mensaje: 'No se puede eliminar la autoría desde aquí. Ve a Gestión de Talleres.', tipo: 'info' });
      return;
    }
    this.notificacionService.confirmar({ titulo: '¿Eliminar inscripción?', mensaje: 'Esta acción borrará el registro de forma permanente.', textoConfirmar: 'Eliminar', textoCancelar: 'Cancelar' }).then(confirmado => {
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

  volver() {
    this.location.back();
  }
}