import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../../services/Taller.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { TallerResponse } from '../../../../interfaces/Taller.Interface';
import { FormTaller } from '../../../../components/forms/form-taller/form-taller';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";

@Component({
  selector: 'app-admin-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, FormTaller, Confirmacion, Notificacion],
  templateUrl: './admin-talleres.html',
  styleUrl: './admin-talleres.scss'
})
export class AdminTalleres implements OnInit {
  talleres: TallerResponse[] = [];
  busqueda: string = '';
  mostrarModal: boolean = false;
  tallerSeleccionado: TallerResponse | null = null;

  constructor(
    private tallerService: TallerService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarTalleres();
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

  get talleresFiltrados() {
    const term = this.busqueda.toLowerCase().trim();
    return this.talleres.filter(t =>
      (t.nombre + (t.nombreCompletoProfesor || '')).toLowerCase().includes(term)
    );
  }

  abrirCrear() {
    this.tallerSeleccionado = null;
    this.mostrarModal = true;
    console.log('Modal abierto (Crear):', this.mostrarModal);
    this.cdr.detectChanges();
  }

  abrirEditar(t: TallerResponse) {
    this.tallerSeleccionado = JSON.parse(JSON.stringify(t));
    this.mostrarModal = true;
    console.log('Modal abierto (Editar):', this.mostrarModal);
    this.cdr.detectChanges();
  }

  ejecutarGuardado(fd: FormData): void {
    const operacion = this.tallerSeleccionado 
      ? this.tallerService.actualizar(this.tallerSeleccionado.idTaller, fd)
      : this.tallerService.crear(fd);

    operacion.subscribe({
      next: (res) => {
        this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: res.mensaje || 'Operación exitosa', tipo: 'exito' });
        this.mostrarModal = false;
        this.cargarTalleres();
      },
      error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'Error en el servidor', tipo: 'error' })
    });
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
}