import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InscripcionService } from '../../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { InscripcionResponse } from '../../../../interfaces/Inscripcion.Interface';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";

@Component({
  selector: 'app-admin-inscripciones',
  standalone: true,
  imports: [CommonModule, Confirmacion, Notificacion],
  templateUrl: './admin-inscripciones.html',
  styleUrl: './admin-inscripciones.scss',
})
export class AdminInscripciones implements OnInit {
  inscripciones: InscripcionResponse[] = [];
  cargando = true;

  // Contexto de la vista (Viene por URL)
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
    // Detectamos si venimos de la gestión de un Taller o de un Usuario
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

  /**
   * Carga la lista de inscripciones desde el servidor
   */
  cargarDatos(tipo: 'taller' | 'usuario', id: number) {
    this.cargando = true;
    
    const peticion = tipo === 'taller' 
      ? this.inscripcionService.listarPorTaller(id) 
      : this.inscripcionService.listarPorUsuario(id);

    peticion.subscribe({
      next: (res) => {
        this.inscripciones = res.data;
        this.configurarTextos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.notificacionService.mostrar({ 
          titulo: 'Error', 
          mensaje: 'No se pudo obtener la información de las inscripciones', 
          tipo: 'error' 
        });
      }
    });
  }

  /**
   * Configura dinámicamente los títulos de la cabecera
   */
  configurarTextos() {
    if (this.esVistaTaller) {
      this.titulo = "Gestión de Alumnos";
      this.subtitulo = this.inscripciones.length > 0 
        ? `Inscritos en ${this.inscripciones[0].nombreTaller}` 
        : "No hay alumnos inscritos en este taller";
    } else {
      this.titulo = "Talleres del Usuario";
      this.subtitulo = this.inscripciones.length > 0 
        ? `Cursos activos de ${this.inscripciones[0].emailUsuario}` 
        : "Este usuario no tiene inscripciones activas";
    }
  }

  /**
   * Cambia el estado de la inscripción (Activa / Baja)
   */
  alternarEstado(id: number) {
    this.inscripcionService.cambiarEstado(id).subscribe({
      next: (res) => {
        // Actualizamos el registro en el array local para reflejar el cambio en la tabla
        const index = this.inscripciones.findIndex(i => i.idInscripcion === id);
        if (index !== -1) {
          this.inscripciones[index].activa = res.data.activa;
          this.cdr.detectChanges();
        }

        this.notificacionService.mostrar({ 
          titulo: 'Estado Actualizado', 
          mensaje: `La inscripción ahora está ${res.data.activa ? 'Activa' : 'de Baja'}`, 
          tipo: 'exito' 
        });
      },
      error: () => {
        this.notificacionService.mostrar({ 
          titulo: 'Error', 
          mensaje: 'No se pudo cambiar el estado de la inscripción', 
          tipo: 'error' 
        });
      }
    });
  }

  /**
   * Elimina permanentemente una inscripción previa confirmación
   */
  eliminar(id: number) {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar Inscripción?',
      mensaje: 'Esta acción es irreversible y el alumno perderá acceso al material.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then(confirmado => {
      if (confirmado) {
        this.inscripcionService.eliminar(id).subscribe({
          next: () => {
            // Eliminamos del array local
            this.inscripciones = this.inscripciones.filter(i => i.idInscripcion !== id);
            this.cdr.detectChanges();
            
            this.notificacionService.mostrar({ 
              titulo: 'Éxito', 
              mensaje: 'Inscripción eliminada correctamente', 
              tipo: 'exito' 
            });
          }
        });
      }
    });
  }

  /**
   * Lógica para el botón de inscribir (Aquí llamarías a tu modal de creación)
   */
  abrirInscripcion() {
    // Aquí iría la lógica para abrir el modal de "Nueva Inscripción"
    console.log("Abrir modal para:", this.esVistaTaller ? 'Taller ' + this.idTaller : 'Usuario ' + this.idUsuario);
    
    this.notificacionService.mostrar({
      titulo: 'Nueva Inscripción',
      mensaje: 'El formulario de registro se abrirá en un modal.',
      tipo: 'info'
    });
  }

  /**
   * Navegación hacia atrás
   */
  volver() {
    this.location.back();
  }
}