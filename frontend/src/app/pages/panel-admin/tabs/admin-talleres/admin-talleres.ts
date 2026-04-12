import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../../services/Taller.Service';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { TallerResponse } from '../../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
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
  profesores: UsuarioResponse[] = [];
  busqueda: string = '';
  criterioBusqueda: string = 'todos'; // Nuevo criterio
  mostrarModal: boolean = false;
  tallerSeleccionado: TallerResponse | null = null;

  constructor(
    private tallerService: TallerService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarTalleres();
    this.cargarProfesores();
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

  cargarProfesores(): void {
    this.usuarioService.listarPorRol(2).subscribe({
      next: (res) => {
        this.profesores = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  get talleresFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    if (!term) return this.talleres;

    return this.talleres.filter(t => {
      const nombreTaller = (t.nombre || '').toLowerCase();
      const nombreProfesor = (t.nombreCompletoProfesor || '').toLowerCase();

      switch (this.criterioBusqueda) {
        case 'nombre':
          return nombreTaller.includes(term);
        case 'profesor':
          return nombreProfesor.includes(term);
        default: // todos
          return nombreTaller.includes(term) || nombreProfesor.includes(term);
      }
    });
  }

  getPlaceholder() {
    switch (this.criterioBusqueda) {
      case 'nombre': return 'Escribe el nombre del taller...';
      case 'profesor': return 'Escribe el nombre del profesor...';
      default: return 'Buscar por taller o profesor...';
    }
  }

  // --- Acciones ---
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
    if (this.tallerSeleccionado) {
      this.tallerService.actualizar(this.tallerSeleccionado.idTaller, fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Taller actualizado', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarTalleres();
        }
      });
    } else {
      this.tallerService.crear(fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Taller creado', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarTalleres();
        }
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