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
import { TallerResponse } from "../../interfaces/Taller.Interface";
import { FormTaller } from "../../components/forms/form-taller/form-taller";
import { FormInscripcion } from "../../components/forms/form-inscripcion/form-inscripcion";
import { Confirmacion } from "../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../components/dialogs/mensaje/notificacion";
import { InscripcionResponse } from "../../interfaces/Inscripcion.Interface";

/**
 * Componente principal para la exploración, filtrado y gestión de talleres.
 * Permite a los usuarios inscribirse y a los administradores gestionar el catálogo.
 */
@Component({
  selector: 'app-talleres-explorar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, Navbar, Footer, 
    FormTaller, FormInscripcion, Confirmacion, Notificacion
  ],
  templateUrl: './talleres-explorar.html',
  styleUrl: './talleres-explorar.scss',
})
export class TalleresExplorar implements OnInit {

  // --- Propiedades de Datos ---
  talleres: TallerResponse[] = [];            // Listado maestro obtenido del servidor
  talleresFiltrados: TallerResponse[] = [];    // Listado procesado para mostrar en la vista
  misInscripcionesIds: number[] = [];         // Almacena IDs de talleres para control de botones

  // --- Propiedades de Estado y UI ---
  filtroForm: FormGroup;                      // Control reactivo de los filtros
  cargando: boolean = true;                   // Spinner/Loader de carga inicial
  puedeGestionar: boolean = false;            // Flag de autorización (Admin/Profesor)

  // --- Gestión de Modales ---
  mostrarModalForm: boolean = false;          // Visibilidad modal Alta/Edición
  mostrarModalInscripcion: boolean = false;   // Visibilidad modal de Pago/Registro
  tallerSeleccionado: TallerResponse | null = null; // Buffer para edición o inscripción

  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private inscripcionService: InscripcionService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef,
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
        const datos = res.data || res;
        if (Array.isArray(datos)) {
          this.misInscripcionesIds = datos.map((ins: any) => {
            // Mapeo flexible de ID según respuesta del servidor (CamelCase o SnakeCase)
            const id = ins.idTaller || ins.id_taller || ins.tallerId;
            return Number(id);
          });
          
          // Limpieza de datos corruptos y actualización de vista
          this.misInscripcionesIds = this.misInscripcionesIds.filter(id => !isNaN(id));
          this.cdr.detectChanges();
        }
      }
    });
  }

  /**
   * Comprueba si un taller específico ya está en la lista de inscritos del usuario.
   * @param idTaller ID del taller a verificar.
   */
  estaInscrito(idTaller: number): boolean {
    return this.misInscripcionesIds.includes(Number(idTaller));
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
      const coincideTexto = t.nombre.toLowerCase().includes(buscar) || 
                            t.descripcion.toLowerCase().includes(buscar);
      const coincidePrecio = t.precio <= precioMax;
      const coincidePlazas = soloDisponibles ? t.plazasDisponibles > 0 : true;

      return coincideTexto && coincidePrecio && coincidePlazas;
    });
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
   * Prepara el proceso de inscripción. Valida que el usuario esté logueado.
   * @param taller Taller al que se desea apuntar el usuario.
   */
  abrirInscripcion(taller: TallerResponse): void {
    if (!this.tokenService.isLogged()) {
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Inicia sesión para inscribirte', tipo: 'error' });
      return;
    }
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalInscripcion = true;
  }

  /**
   * Finaliza la inscripción tras el pago exitoso en el modal.
   * @param dto Datos de la transacción de inscripción.
   */
  finalizarInscripcion(dto: any): void {
    this.inscripcionService.inscribir(dto).subscribe({
      next: () => {
        this.notify.mostrar({ titulo: '¡Éxito!', mensaje: 'Inscripción realizada', tipo: 'exito' });
        this.mostrarModalInscripcion = false;
        this.cargarTalleres();
        this.cargarMisInscripciones(); // Refresco de estado local
      },
      error: () => this.notify.mostrar({ titulo: 'Error', mensaje: 'No se pudo procesar', tipo: 'error' })
    });
  }

  /**
   * Elimina un taller del catálogo tras confirmación del usuario.
   * @param taller Taller a eliminar.
   */
  async eliminarTaller(taller: TallerResponse): Promise<void> {
    const confirmar = await this.notify.confirmar({ 
      titulo: 'Eliminar', 
      mensaje: `¿Borrar "${taller.nombre}"?` 
    });

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