import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    CommonModule, RouterModule, Navbar, Footer, 
    FormTaller, FormInscripcion, // <--- Añadido FormInscripcion
    Confirmacion, Notificacion
  ],
  templateUrl: './talleres-explorar.html',
  styleUrl: './talleres-explorar.scss',
})
export class TalleresExplorar implements OnInit {

  talleres: TallerResponse[] = [];
  cargando: boolean = true;
  puedeGestionar: boolean = false;

  // Modales
  mostrarModalForm: boolean = false;        // Para Taller (Admin)
  mostrarModalInscripcion: boolean = false; // Para Inscripción (Usuario)
  tallerSeleccionado: TallerResponse | null = null;

  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private inscripcionService: InscripcionService, // Inyectado
    private notify: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.comprobarPermisos();
    this.cargarTalleres();
  }

  comprobarPermisos(): void {
    const rol = this.tokenService.getRol();
    this.puedeGestionar = (rol === 'ADMIN' || rol === 'PROFESOR');
  }

  cargarTalleres(): void {
    this.tallerService.listarTodos().subscribe({
      next: (response) => {
        this.talleres = response.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.notify.mostrar({ titulo: 'Error', mensaje: 'Error al cargar talleres', tipo: 'error' });
      }
    });
  }

  // --- LÓGICA TALLERES (ADMIN) ---
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
    if (!id) {
      // Si no hay id, es creación
      this.tallerService.crear(fd).subscribe({
        next: () => {
          this.notify.mostrar({ titulo: 'Éxito', mensaje: 'Taller creado', tipo: 'exito' });
          this.mostrarModalForm = false;
          this.cargarTalleres();
        }
      });
      return;
    }

    this.tallerService.actualizar(id, fd).subscribe({
      next: () => {
        this.notify.mostrar({ titulo: 'Éxito', mensaje: 'Taller actualizado', tipo: 'exito' });
        this.mostrarModalForm = false;
        this.cargarTalleres();
      }
    });
  }

  // --- LÓGICA INSCRIPCIÓN (USUARIO) ---
  abrirInscripcion(taller: TallerResponse): void {
    if (!this.tokenService.isLogged()) {
      this.notify.mostrar({ titulo: 'Atención', mensaje: 'Debes iniciar sesión para inscribirte', tipo: 'error' });
      return;
    }
    this.tallerSeleccionado = { ...taller };
    this.mostrarModalInscripcion = true;
  }

  finalizarInscripcion(dto: any): void {
    this.inscripcionService.inscribir(dto).subscribe({
      next: () => {
        this.notify.mostrar({ titulo: '¡Enhorabuena!', mensaje: 'Inscripción realizada con éxito', tipo: 'exito' });
        this.mostrarModalInscripcion = false;
        this.cargarTalleres(); // Recargamos para actualizar plazas disponibles
      },
      error: (err) => {
        this.notify.mostrar({ titulo: 'Error', mensaje: 'Ya estás inscrito o no quedan plazas', tipo: 'error' });
      }
    });
  }

  async eliminarTaller(taller: TallerResponse): Promise<void> {
    const confirmar = await this.notify.confirmar({
      titulo: 'Eliminar Taller',
      mensaje: `¿Estás seguro de borrar "${taller.nombre}"?`
    });

    if (confirmar) {
      this.tallerService.eliminar(taller.idTaller).subscribe({
        next: () => {
          this.talleres = this.talleres.filter(t => t.idTaller !== taller.idTaller);
          this.notify.mostrar({ titulo: 'Borrado', mensaje: 'Taller eliminado', tipo: 'exito' });
        }
      });
    }
  }
}