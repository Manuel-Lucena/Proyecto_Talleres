import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../../services/Taller.Service';
import { UsuarioService } from '../../../../services/Usuario.Service'; // <-- AÑADIDO
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { TallerResponse } from '../../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface'; // <-- AÑADIDO
import { FormTaller } from '../../../../components/forms/form-taller/form-taller';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, FormTaller, Confirmacion, Notificacion],
  templateUrl: './admin-talleres.html',
  styleUrl: './admin-talleres.scss'
})
export class AdminTalleres implements OnInit {
  talleres: TallerResponse[] = [];
  profesores: UsuarioResponse[] = []; // <-- Variable para almacenar los profesores
  busqueda: string = '';
  mostrarModal: boolean = false;
  tallerSeleccionado: TallerResponse | null = null;

  constructor(
    private tallerService: TallerService,
    private usuarioService: UsuarioService, // <-- Inyectamos el servicio de usuarios
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarTalleres();
    this.cargarProfesores(); // <-- Los cargamos al iniciar
  }

  cargarTalleres(): void {
    this.tallerService.listarTodos().subscribe({
      next: (res) => {
        this.talleres = [...res.data];
        this.cdr.detectChanges();
      },
      error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudieron cargar los talleres', tipo: 'error' })
    });
  }

  // MÉTODO NUEVO: Carga solo usuarios con rol de Profesor (ID: 2)
  cargarProfesores(): void {
    this.usuarioService.listarPorRol(2).subscribe({
      next: (res) => {
        this.profesores = res.data; // Extraemos el array de la respuesta
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar profesores:', err)
    });
  }

  get talleresFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    return this.talleres.filter(t =>
      (t.nombre + (t.nombreCompletoProfesor || '')).toLowerCase().includes(term)
    );
  }

  abrirCrear() {
    this.tallerSeleccionado = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirEditar(t: TallerResponse) {
    this.tallerSeleccionado = JSON.parse(JSON.stringify(t));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  ejecutarGuardado(fd: FormData): void {
    // Si tenemos tallerSeleccionado, es una actualización
    if (this.tallerSeleccionado) {
      const id = this.tallerSeleccionado.idTaller;
      this.tallerService.actualizar(id, fd).subscribe({
        next: (res) => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Taller actualizado', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarTalleres(); // Recargamos la lista
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      // Es una creación
      this.tallerService.crear(fd).subscribe({
        next: (res) => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Taller creado', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarTalleres();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
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

  verInscritos(idTaller: number) {
    this.router.navigate(['/panel-admin/talleres', idTaller, 'inscripciones']);
  }


  verHorario(id: number) {
    this.router.navigate(['/panel-admin/talleres', id, 'horario']);
  }
}