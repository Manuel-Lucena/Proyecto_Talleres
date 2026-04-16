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
import { FormCargaInscripciones } from '../../../../components/forms/form-carga-inscripciones/form-carga-inscripciones';

/**
 * Componente administrativo polivalente para la gestión de inscripciones.
 * Funciona en dos modos:
 * 1. Vista de Taller: Muestra todos los alumnos inscritos en un taller específico.
 * 2. Vista de Usuario: Muestra todos los talleres en los que participa un alumno.
 */
@Component({
  selector: 'app-admin-inscripciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule, Confirmacion, Notificacion, 
    FormInscripcionAdmin, FormCargaInscripciones
  ],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {

  // --- Propiedades de Datos y Colecciones ---
  inscripciones: InscripcionResponse[] = []; // Listado de registros según contexto
  tallerContexto: any = null;                // Datos del taller (si estamos en vista taller)
  usuarioContexto: any = null;               // Datos del usuario (si estamos en vista usuario)
  
  // --- Estado de la Ruta y Parámetros ---
  idTaller?: number;
  idUsuario?: number;
  esVistaTaller = false; // Flag para conmutar la lógica de la UI y peticiones

  // --- UI, Mensajes y Modales ---
  cargando = true;
  mostrarModal = false;           // Modal para inscripción individual
  mostrarModalMasivo = false;     // Modal para carga mediante CSV/Excel
  busqueda: string = '';          // Filtro de texto para la tabla
  titulo = '';                    // Título dinámico de la página
  subtitulo = '';                 // Subtítulo dinámico de la página

  // --- Flags de Procesos de Descarga ---
  descargandoLista = false;               // Estado para el PDF de lista de alumnos
  descargandoFacturaId: number | null = null; // ID específico para el spinner de factura

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private inscripcionService: InscripcionService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Ciclo de vida: Analiza los parámetros de la URL para determinar el modo de funcionamiento.
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
    const peticion = tipo === 'taller' 
      ? this.inscripcionService.listarPorTaller(id) 
      : this.inscripcionService.listarPorUsuario(id);

    peticion.subscribe({
      next: (res) => {
        this.inscripciones = res.data || [];
        
        // Sincronización de contextos para mostrar info en las cabeceras
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
   * Getter que filtra la tabla dinámicamente según el contexto (por email o por nombre de taller).
   */
  get inscripcionesFiltradas() {
    const term = this.busqueda?.toLowerCase().trim();
    if (!term) return this.inscripciones;

    return this.inscripciones.filter(ins => {
      // En vista taller buscamos por el email del alumno, en vista usuario por el nombre del taller
      return this.esVistaTaller 
        ? ins.emailUsuario?.toLowerCase().includes(term)
        : ins.nombreTaller?.toLowerCase().includes(term);
    });
  }

  /**
   * Ajusta los títulos de la interfaz para que el administrador sepa qué está gestionando.
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

  // ===========================================================================
  // --- GESTIÓN DE INSCRIPCIONES (MODALES) ---
  // ===========================================================================

  abrirInscripcion() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  /**
   * Persiste una inscripción manual realizada por el administrador.
   */
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

  /**
   * Abre el flujo de carga masiva de inscripciones (solo disponible en vista de taller).
   */
  abrirInscripcionMasiva() {
    if (this.esVistaTaller && this.idTaller) {
      this.mostrarModalMasivo = true;
    }
  }

  cerrarModalMasivo() { this.mostrarModalMasivo = false; }
  onMasivoGuardado() { this.refrescarDatos(); }

  private refrescarDatos() {
    if (this.idTaller) this.cargarDatos('taller', this.idTaller);
    else if (this.idUsuario) this.cargarDatos('usuario', this.idUsuario);
  }

  // ===========================================================================
  // --- DESCARGAS Y EXPORTACIÓN ---
  // ===========================================================================

  /**
   * Gestiona la descarga del PDF de factura de una inscripción concreta.
   * Utiliza window.URL.createObjectURL para procesar el Blob devuelto por el servidor.
   */
  descargarFactura(idInscripcion: number) {
    this.descargandoFacturaId = idInscripcion;
    this.inscripcionService.descargarFactura(idInscripcion).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_${idInscripcion}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); // Liberación de memoria
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

  /**
   * Exporta la lista completa de alumnos de un taller en formato PDF.
   */
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
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo generar la lista de alumnos.', tipo: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- ACCIONES DE TABLA ---
  // ===========================================================================

  /**
   * Cambia el estado (activa/inactiva) de una inscripción sin necesidad de recargar toda la lista.
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
   * Elimina un registro de inscripción de forma definitiva.
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
            this.notificacionService.mostrar({ titulo: 'Inscripción eliminada', mensaje: 'El registro ha sido borrado correctamente.', tipo: 'exito' });
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.notificacionService.mostrar({ titulo: 'Error', mensaje: err.error?.message || 'No se pudo eliminar la inscripción', tipo: 'error' });
          }
        });
      }
    });
  }

  /**
   * Navega a la pantalla anterior utilizando el servicio de Location.
   */
  volver() {
    this.location.back();
  }
}