import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HorarioResponse, HorarioRequest } from '../../../../interfaces/Horario.Interface';
import { FormHorario } from "../../../../components/forms/form-horario/form-horario";
import { HorarioService } from '../../../../services/Horario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";

/**
 * Componente administrativo para la gestión de la planificación semanal de un taller.
 * Permite organizar las franjas horarias por días de la semana, facilitando la 
 * visualización tipo "agenda" y el control de sesiones.
 */
@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormHorario, Confirmacion, Notificacion],
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios implements OnInit {

  // --- Datos de Contexto ---
  tallerId!: number;                      // ID del taller padre extraído de la ruta
  listaHorarios: HorarioResponse[] = [];   // Buffer de todas las sesiones del taller

  // --- Configuración de la Vista ---
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // --- Estado de UI (Modales) ---
  mostrarModal = false;        // Control de visibilidad del modal de creación
  diaSeleccionado = '';        // Almacena el contexto del día al que se añade una sesión

  /**
   * @param route Extrae parámetros de la URL activa.
   * @param horarioService Servicio especializado en persistencia de franjas horarias.
   * @param notificacionService Sistema de alertas y confirmaciones de seguridad.
   * @param cdr Necesario para sincronizar la UI tras actualizaciones dinámicas del array.
   */
  constructor(
    private route: ActivatedRoute,
    private horarioService: HorarioService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Captura el parámetro 'id' de la URL y dispara la carga de horarios.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tallerId = Number(params['id']);
      this.cargarHorarios();
    });
  }

  /**
   * Recupera desde el servidor todas las sesiones programadas para este taller.
   */
  cargarHorarios(): void {
    this.horarioService.listarPorTaller(this.tallerId).subscribe({
      next: (resp) => {
        this.listaHorarios = [...(resp.data || [])];
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Transforma los datos del formulario en un objeto HorarioRequest y lo persiste.
   * @param datosDelForm Valores emitidos por el componente FormHorario.
   */
  ejecutarGuardado(datosDelForm: any): void {
    const nuevoHorario: HorarioRequest = {
      idTaller: this.tallerId,
      diaSemana: datosDelForm.diaSemana,
      horaInicio: datosDelForm.horaInicio,
      horaFin: datosDelForm.horaFin
    };

    this.horarioService.crear(nuevoHorario).subscribe({
      next: () => {
        this.notificacionService.mostrar({ 
          titulo: 'Éxito', 
          mensaje: 'Nueva sesión horaria programada', 
          tipo: 'exito' 
        });
        this.mostrarModal = false;
        this.cargarHorarios(); 
      },
      error: () => this.notificacionService.mostrar({ 
        titulo: 'Error', 
        mensaje: 'No se pudo guardar la sesión (posible solapamiento)', 
        tipo: 'error' 
      })
    });
  }

  /**
   * Solicita confirmación y ejecuta la eliminación física de una franja horaria.
   * @param id ID de la sesión (idHorario).
   */
  eliminarSesion(id: number): void {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar sesión?',
      mensaje: 'Esta acción es irreversible y afectará a la visualización de los alumnos.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.horarioService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ 
              titulo: 'Eliminado', 
              mensaje: 'La franja horaria ha sido eliminada', 
              tipo: 'exito' 
            });
            this.cargarHorarios();
          },
          error: () => this.notificacionService.mostrar({ 
            titulo: 'Error', 
            mensaje: 'No se pudo eliminar la sesión', 
            tipo: 'error' 
          })
        });
      }
    });
  }

  // ===========================================================================
  // --- MÉTODOS DE AYUDA PARA LA VISTA (HELPERS) ---
  // ===========================================================================

  /**
   * Filtra las sesiones que pertenecen a un día concreto para pintar la columna de la agenda.
   * @param dia Nombre del día ('Lunes', 'Martes', etc.)
   */
  getSesionesPorDia(dia: string): HorarioResponse[] {
    return this.listaHorarios.filter(h => h.diaSemana === dia);
  }

  /**
   * Abre el modal de creación pre-asignando el día de la semana.
   * @param dia Día en el que se hizo clic.
   */
  abrirModalSesion(dia: string): void {
    this.diaSeleccionado = dia;
    this.mostrarModal = true;
  }
}