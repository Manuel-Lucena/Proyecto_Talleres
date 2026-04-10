import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InscripcionService } from '../../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { InscripcionResponse } from '../../../../interfaces/Inscripcion.Interface';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { FormInscripcionAdmin } from '../../../../components/forms/form-inscripcion-admin/form-inscripcion-admin';

@Component({
  selector: 'app-admin-inscripciones',
  standalone: true,
  imports: [CommonModule, Confirmacion, Notificacion, FormInscripcionAdmin],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {
  inscripciones: InscripcionResponse[] = [];
  cargando = true;
  mostrarModal = false;

  // CONTEXTOS PARA EL MODAL
  tallerContexto: any = null;
  usuarioContexto: any = null; // <--- Agregamos esta propiedad

  idTaller?: number;
  idUsuario?: number;
  esVistaTaller = false; 

  titulo = '';
  subtitulo = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private inscripcionService: InscripcionService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

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

  cargarDatos(tipo: 'taller' | 'usuario', id: number) {
    this.cargando = true;
    const peticion = tipo === 'taller' 
      ? this.inscripcionService.listarPorTaller(id) 
      : this.inscripcionService.listarPorUsuario(id);

    peticion.subscribe({
      next: (res) => {
        this.inscripciones = res.data;
        
        // CONFIGURACIÓN DE CONTEXTOS SEGÚN LA VISTA
        if (tipo === 'taller') {
          this.usuarioContexto = null; // Limpiamos contexto de usuario
          this.tallerContexto = {
            idTaller: id,
            nombre: this.inscripciones.length > 0 ? this.inscripciones[0].nombreTaller : 'Taller',
            precio: this.inscripciones.length > 0 ? this.inscripciones[0].montoPagado : 0
          };
        } else {
          this.tallerContexto = null; // Limpiamos contexto de taller
          this.usuarioContexto = {
            idUsuario: id,
            email: this.inscripciones.length > 0 ? this.inscripciones[0].emailUsuario : 'Usuario'
          };
        }

        this.configurarTextos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

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

  abrirInscripcion() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarInscripcion(datos: any) {
    this.inscripcionService.inscribir(datos).subscribe({
      next: () => {
        this.notificacionService.mostrar({ 
          titulo: 'Éxito', 
          mensaje: 'Registrado correctamente', 
          tipo: 'exito' 
        });
        this.cerrarModal();
        if (this.idTaller) this.cargarDatos('taller', this.idTaller);
        else if (this.idUsuario) this.cargarDatos('usuario', this.idUsuario);
      },
      error: (err) => {
        this.notificacionService.mostrar({ 
          titulo: 'Error', 
          mensaje: err.error?.message || 'Error al inscribir', 
          tipo: 'error' 
        });
      }
    });
  }

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

  eliminar(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar?',
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then(confirmado => {
      if (confirmado) {
        this.inscripcionService.eliminar(id).subscribe({
          next: () => {
            this.inscripciones = this.inscripciones.filter(i => i.idInscripcion !== id);
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  volver() {
    this.location.back();
  }
}