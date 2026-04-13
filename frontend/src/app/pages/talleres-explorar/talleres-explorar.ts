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

/**
 * Componente principal para la exploración, filtrado y gestión de talleres.
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

  talleres: TallerResponse[] = []; // Listado completo de talleres desde el servidor
  talleresFiltrados: TallerResponse[] = []; // Listado tras aplicar filtros de búsqueda
  filtroForm: FormGroup; // Formulario reactivo para los filtros de la vista
  cargando: boolean = true; // Estado de carga de la petición inicial
  puedeGestionar: boolean = false; // Flag de permisos para acciones de Admin/Profesor

  mostrarModalForm: boolean = false; // Control de visibilidad del formulario de taller
  mostrarModalInscripcion: boolean = false; // Control de visibilidad del formulario de pago
  tallerSeleccionado: TallerResponse | null = null; // Taller activo para editar o inscribir

  /**
   * @param tallerService Servicio para operaciones CRUD de talleres.
   * @param tokenService Servicio para validar identidad y roles.
   * @param inscripcionService Servicio para procesar registros de alumnos.
   * @param notify Servicio centralizado de alertas y confirmaciones.
   * @param cdr Detección manual de cambios para procesos asíncronos.
   * @param fb Constructor de formularios reactivos.
   */
  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private inscripcionService: InscripcionService,
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      texto: [''],
      precioMax: [500],
      soloDisponibles: [false]
    });
  }

  /**
   * Inicializa la vista comprobando permisos y cargando los datos iniciales.
   */
  ngOnInit(): void {
    this.comprobarPermisos();
    this.cargarTalleres();
    
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  /**
   * Determina si el usuario actual tiene rango suficiente para crear o editar talleres.
   */
  comprobarPermisos(): void {
    const rol = this.tokenService.getRol();
    this.puedeGestionar = (rol === 'ADMIN' || rol === 'PROFESOR');
  }

  /**
   * Recupera la colección de talleres de la API.
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
   * Filtra la lista de talleres en base al texto, precio y disponibilidad de plazas.
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
   * Resetea los filtros a sus valores por defecto.
   */
  limpiarFiltros(): void {
    this.filtroForm.patchValue({ texto: '', precioMax: 500, soloDisponibles: false });
  }

  /**
   * Prepara el estado para crear un nuevo taller.
   */
  abrirCreacion(): void {
    this.tallerSeleccionado = null;
    this.mostrarModalForm = true;
  }

  /**
   * Carga un taller específico para su edición.
   * @param taller El objeto taller a editar.
   */
  abrirEdicion(taller: TallerResponse): void {
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalForm = true;
  }

  /**
   * Persiste los datos (creación o actualización) mediante FormData.
   * @param fd Datos del taller incluyendo posible archivo de imagen.
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
   * Inicia el proceso de inscripción validando sesión previa.
   * @param taller Taller al que se desea inscribir el alumno.
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
   * Envía los datos de inscripción y pago al servidor.
   * @param dto Objeto con la información de la inscripción.
   */
  finalizarInscripcion(dto: any): void {
    this.inscripcionService.inscribir(dto).subscribe({
      next: () => {
        this.notify.mostrar({ titulo: '¡Éxito!', mensaje: 'Inscripción realizada', tipo: 'exito' });
        this.mostrarModalInscripcion = false;
        this.cargarTalleres();
      },
      error: () => this.notify.mostrar({ titulo: 'Error', mensaje: 'No se pudo procesar', tipo: 'error' })
    });
  }

  /**
   * Solicita confirmación y elimina un taller del sistema.
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