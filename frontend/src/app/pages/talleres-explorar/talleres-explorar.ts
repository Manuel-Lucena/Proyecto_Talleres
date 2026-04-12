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

  talleres: TallerResponse[] = [];
  talleresFiltrados: TallerResponse[] = [];
  filtroForm: FormGroup;
  cargando: boolean = true;
  puedeGestionar: boolean = false;

  mostrarModalForm: boolean = false;
  mostrarModalInscripcion: boolean = false;
  tallerSeleccionado: TallerResponse | null = null;

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

  ngOnInit(): void {
    this.comprobarPermisos();
    this.cargarTalleres();
    
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  comprobarPermisos(): void {
    const rol = this.tokenService.getRol();
    this.puedeGestionar = (rol === 'ADMIN' || rol === 'PROFESOR');
  }

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

  limpiarFiltros(): void {
    this.filtroForm.patchValue({ texto: '', precioMax: 500, soloDisponibles: false });
  }

  abrirCreacion(): void {
    this.tallerSeleccionado = null;
    this.mostrarModalForm = true;
  }

  abrirEdicion(taller: TallerResponse): void {
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalForm = true;
  }

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

  abrirInscripcion(taller: TallerResponse): void {
    if (!this.tokenService.isLogged()) {
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Inicia sesión para inscribirte', tipo: 'error' });
      return;
    }
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalInscripcion = true;
  }

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