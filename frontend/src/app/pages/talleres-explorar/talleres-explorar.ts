import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from "../../components/layout/navbar/navbar";
import { Footer } from "../../components/layout/footer/footer";
import { TallerService } from "../../services/Taller.Service";
import { TokenService } from "../../services/Token.Service";
import { InscripcionService } from "../../services/Inscripcion.Service";
import { NotificacionService } from "../../services/Notificacion.Service";
import { UsuarioService } from "../../services/Usuario.Service";
import { TallerResponse } from "../../interfaces/Taller.Interface";
import { UsuarioResponse } from "../../interfaces/Usuario.Interface";
import { FormTaller } from "../../components/forms/form-taller/form-taller";
import { FormInscripcion } from "../../components/forms/form-inscripcion/form-inscripcion";
import { Confirmacion } from "../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../components/dialogs/mensaje/notificacion";
import { HorarioTaller } from "../../components/dialogs/horario-taller/horario-taller";
import { PasarelaService } from '../../services/Pasarela.Service';

/**
 * Componente principal para la exploración, filtrado y gestión de talleres.
 * Permite a los usuarios inscribirse y a los administradores gestionar el catálogo.
 */
@Component({
  selector: 'app-talleres-explorar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    Navbar,
    Footer,
    FormTaller,
    FormInscripcion,
    Confirmacion,
    Notificacion,
    HorarioTaller
  ],
  templateUrl: './talleres-explorar.html',
  styleUrl: './talleres-explorar.scss',
})
export class TalleresExplorar implements OnInit {
  // --- Propiedades de Datos ---
  talleres: TallerResponse[] = [];            // Listado maestro obtenido del servidor
  talleresFiltrados: TallerResponse[] = [];   // Listado procesado para mostrar en la vista
  misTalleresIds: any[] = [];              // Almacena Id de talleres para control de botones
  profesores: UsuarioResponse[] = [];         // Listado de profesores para el formulario
  esAlumno: boolean = false;

  // --- Propiedades de Estado y UI ---
  filtroForm: FormGroup;                      // Control reactivo de los filtros
  cargando: boolean = true;                   // Spinner/Loader de carga inicial
  puedeGestionar: boolean = false;            // Flag de autorización (Admin/Profesor)

  // --- Gestión de Modales ---
  mostrarModalForm: boolean = false;          // Visibilidad modal Alta/Edición
  mostrarModalInscripcion: boolean = false;   // Visibilidad modal de Pago/Registro
  mostrarModalHorarios: boolean = false;      // Visibilidad modal de Horario
  tallerSeleccionado: TallerResponse | null = null; // Buffer para edición o inscripción

  constructor(
    private tallerService: TallerService,
    public tokenService: TokenService,
    private inscripcionService: InscripcionService,
    private usuarioService: UsuarioService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef,
    private pasarelaService: PasarelaService,
    private fb: FormBuilder
  ) {
    // Inicialización del formulario de filtros con valores por defecto
    this.filtroForm = this.fb.group({
      texto: [''],
      precioMax: [500],
      soloDisponibles: [false]
    });
  }

  /**
   * Ciclo de vida: Inicializa los permisos, carga los talleres y escucha cambios en filtros.
   */
  ngOnInit(): void {
    this.comprobarPermisos();
    this.cargarTalleres();
    this.cargarProfesores();

    // Si hay sesión activa, recuperamos inscripciones para deshabilitar botones
    if (this.tokenService.isLogged()) {
      this.cargarMisInscripciones();
    }

    // Suscripción reactiva a los cambios del formulario de filtros
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  // ===========================================================================
  // --- CARGA DE DATOS ---
  // ===========================================================================

  /**
   * Carga la lista de usuarios con rol profesor para el componente de creación.
   */
  cargarProfesores(): void {
    this.usuarioService.listarPorRol(2).subscribe({
      next: (res) => {
        this.profesores = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar profesores:', err)
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE INSCRIPCIONES ---
  // ===========================================================================

  /**
   * Recupera las inscripciones del usuario logueado para marcar los talleres ya adquiridos.
   */
  cargarMisInscripciones(): void {
    const idUsuario = this.tokenService.getId();
    if (!idUsuario) return;

    this.inscripcionService.listarPorUsuario(idUsuario).subscribe({
      next: (res) => {
        const inscripciones = res.data || [];
        this.misTalleresIds = inscripciones.map((ins: any) => ins.nombreTaller);
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar inscripciones', err)
    });
  }

  /**
   * Comprueba si un taller específico ya está en la lista de inscritos del usuario.
   * @param nombreTaller nombre del taller a verificar.
   */
  estaInscrito(nombreTaller: string): boolean {
    if (!nombreTaller || !this.misTalleresIds) return false;
    return this.misTalleresIds.includes(nombreTaller);
  }


  // ===========================================================================
  // --- LÓGICA DE NEGOCIO Y FILTROS ---
  // ===========================================================================

  /**
   * Verifica el rol del usuario para habilitar herramientas de gestión.
   */
  comprobarPermisos(): void {
    const rol = this.tokenService.getRol();
    this.puedeGestionar = (rol === 'ADMIN' || rol === 'PROFESOR');
    this.esAlumno = (rol === 'ALUMNO');
  }

  /**
   * Solicita al servidor el listado completo de talleres activos.
   */
  cargarTalleres(): void {
    this.tallerService.listarTodos().subscribe({
      next: (response) => {
        this.talleres = response.data;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.notify.mostrar({ titulo: 'Error', mensaje: 'Error al cargar talleres', tipo: 'error' });
      }
    });
  }

  /**
   * Procesa la búsqueda local sobre el array de talleres cargado.
   */
  aplicarFiltros(): void {
    const { texto, precioMax, soloDisponibles } = this.filtroForm.value;
    const buscar = texto.toLowerCase();
    this.talleresFiltrados = this.talleres.filter(t => {
      const coincideTexto = t.nombre.toLowerCase().includes(buscar);
      const coincidePrecio = t.precio <= precioMax;
      const coincidePlazas = soloDisponibles ? t.plazasDisponibles > 0 : true;
      return coincideTexto && coincidePrecio && coincidePlazas;
    });
  }

  /**
 * Determina si un taller ha finalizado según la fecha actual.
 * @param fechaFin string o Date de finalización del taller.
 */
  tallerFinalizado(fechaFin: any): boolean {
    if (!fechaFin) return false;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    return hoy > fin;
  }

  /**
   * Limpia los inputs del formulario de filtros.
   */
  limpiarFiltros(): void {
    this.filtroForm.patchValue({ texto: '', precioMax: 500, soloDisponibles: false });
  }

  // ===========================================================================
  // --- OPERACIONES CRUD (MODALES) ---
  // ===========================================================================

  /**
   * Abre el formulario para la creación de un nuevo taller.
   */
  abrirCreacion(): void {
    this.tallerSeleccionado = null;
    this.mostrarModalForm = true;
  }

  /**
   * Abre el formulario de edición cargando los datos del taller seleccionado.
   * @param taller Objeto taller a editar.
   */
  abrirEdicion(taller: TallerResponse): void {
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalForm = true;
  }

  /**
   * Envía los datos del taller (incluyendo imágenes) al servidor.
   * @param fd FormData con los campos del taller.
   */
  guardarCambios(fd: FormData): void {
    const id = this.tallerSeleccionado?.idTaller;
    const peticion = id ? this.tallerService.actualizar(id, fd) : this.tallerService.crear(fd);
    peticion.subscribe({
      next: () => {
        this.notify.mostrar({ titulo: 'Éxito', mensaje: 'Operación realizada', tipo: 'exito' });
        this.mostrarModalForm = false;
        this.cargarTalleres();
      }
    });
  }

  /**
   * Prepara el proceso de inscripción. Valida logueo y solapamiento de horarios.
   * @param taller Taller al que se desea apuntar el usuario.
   */
  async abrirInscripcion(taller: TallerResponse): Promise<void> {
    if (!this.tokenService.isLogged()) {
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Inicia sesión para inscribirte', tipo: 'error' });
      return;
    }
    const idUsuario = this.tokenService.getId();
    if (!idUsuario) return;
    this.inscripcionService.validarSolapamiento(idUsuario, taller.idTaller).subscribe({
      next: async (res) => {
        if (res.data && res.data.hayConflicto) {
          const continuar = await this.notify.confirmar({ titulo: '¡Conflicto de Horarios!', mensaje: `Este taller coincide en el tiempo con "${res.data.tallerConflicto}". ¿Deseas inscribirte de todas formas?`, textoConfirmar: 'Sí, continuar', textoCancelar: 'No, revisar' });
          if (!continuar) return;
        }
        this.tallerSeleccionado = { ...taller };
        this.mostrarModalInscripcion = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.tallerSeleccionado = { ...taller };
        this.mostrarModalInscripcion = true;
      }
    });
  }

  /**
   * Abre el visualizador de horarios para un taller específico.
   * @param taller
   */
  verHorarios(taller: TallerResponse): void {
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalHorarios = true;
  }

  /**
   * Finaliza la inscripción tras el pago exitoso en el modal.
   * @param dto Datos de la transacción de inscripción.
   */
  finalizarInscripcion(dto: any): void {

    this.cargando = true;

    this.pasarelaService.procesarPago(dto).subscribe({
      next: (res) => {
        this.notify.mostrar({
          titulo: '¡Pago Confirmado!',
          mensaje: 'Te has inscrito correctamente. Revisa tu email para la factura.',
          tipo: 'exito'
        });

        this.mostrarModalInscripcion = false;
        this.cargarTalleres();
        this.cargarMisInscripciones();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        const msgError = err.error?.message || 'No se pudo procesar el pago';
        this.notify.mostrar({
          titulo: 'Error en el Pago',
          mensaje: msgError,
          tipo: 'error'
        });
      }
    });
  }

  /**
   * Elimina un taller del catálogo tras confirmación del usuario.
   * @param taller Taller a eliminar.
   */
  async eliminarTaller(taller: TallerResponse): Promise<void> {
    const confirmar = await this.notify.confirmar({ titulo: 'Eliminar', mensaje: `¿Borrar "${taller.nombre}"?` });
    if (confirmar) {
      this.tallerService.eliminar(taller.idTaller).subscribe({
        next: () => {
          this.cargarTalleres();
          this.notify.mostrar({ titulo: 'Borrado', mensaje: 'Taller eliminado', tipo: 'exito' });
        }
      });
    }
  }
}