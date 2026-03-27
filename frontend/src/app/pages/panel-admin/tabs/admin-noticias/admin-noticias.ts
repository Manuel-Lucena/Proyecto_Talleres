import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiaService } from '../../../../services/Noticia.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { NoticiaResponse } from '../../../../interfaces/Noticia.Interface';
import { FormNoticia } from '../../../../components/forms/form-noticia/form-noticia';
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Calendario } from "../../../calendario/calendario";
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, FormNoticia, Notificacion, Confirmacion],
  templateUrl: './admin-noticias.html',
  styleUrl: './admin-noticias.scss'
})
export class AdminNoticias implements OnInit {
  noticias: NoticiaResponse[] = [];
  busqueda: string = '';
  mostrarModal: boolean = false;
  noticiaSeleccionada: NoticiaResponse | null = null;

  constructor(
    private noticiaService: NoticiaService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        this.noticias = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  get noticiasFiltradas() {
    return this.noticias.filter(n => 
      n.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  abrirCrear() {
    this.noticiaSeleccionada = null;
    this.mostrarModal = true;
  }

  abrirEditar(n: NoticiaResponse) {
    this.noticiaSeleccionada = { ...n };
    this.mostrarModal = true;
  }

  ejecutarGuardado(fd: FormData): void {
    if (this.noticiaSeleccionada) {
      // MODO EDICIÓN
      this.noticiaService.actualizar(this.noticiaSeleccionada.idNoticia, fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Éxito', mensaje: 'Noticia actualizada', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        },
        error: () => this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo actualizar', tipo: 'error' })
      });
    } else {
      // MODO CREACIÓN
      this.noticiaService.crear(fd).subscribe({
        next: () => {
          this.notificacionService.mostrar({ titulo: 'Publicado', mensaje: 'Noticia lanzada con éxito', tipo: 'exito' });
          this.mostrarModal = false;
          this.cargarNoticias();
        }
      });
    }
  }

  eliminarNoticia(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar noticia?',
      mensaje: 'Esta acción borrará la publicación para siempre.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.noticiaService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Borrada', mensaje: 'Noticia eliminada', tipo: 'exito' });
            this.cargarNoticias();
          }
        });
      }
    });
  }
}