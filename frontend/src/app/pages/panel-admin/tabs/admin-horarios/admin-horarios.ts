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
 * Componente administrativo para la gestión de horarios de un taller específico.
 * Permite visualizar la agenda semanal, añadir nuevas sesiones y eliminar franjas horarias.
 */
@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormHorario, Confirmacion, Notificacion], 
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios implements OnInit {
  tallerId!: number; // Identificador del taller obtenido de la URL
  listaHorarios: HorarioResponse[] = []; // Colección de sesiones horarias del taller
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']; // Estructura de la semana

  mostrarModal = false; // Control de visibilidad del formulario de horarios
  diaSeleccionado = ''; // Almacena el día en el que se desea añadir una sesión

  /**
   * @param route Servicio para extraer parámetros de navegación.
   * @param horarioService Servicio para operaciones CRUD de horarios.
   * @param notificacionService Gestión de feedback visual y diálogos de confirmación.
   * @param cdr Detección de cambios manual para flujos asíncronos.
   */
  constructor(
    private route: ActivatedRoute,
    private horarioService: HorarioService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente recuperando el ID del taller y su planificación horaria.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tallerId = Number(params['id']);
      this.cargarHorarios();
    });
  }

  /**
   * Obtiene la lista actualizada de sesiones horarias para el taller actual.
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
   * Procesa el guardado de una nueva sesión horaria.
   * @param datosDelForm Información proveniente del formulario (día, inicio, fin).
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
          mensaje: 'Horario programado correctamente', 
          tipo: 'exito' 
        });
        this.mostrarModal = false;
        this.cargarHorarios();
      },
      error: () => this.notificacionService.mostrar({ 
        titulo: 'Error', 
        mensaje: 'No se pudo guardar el horario', 
        tipo: 'error' 
      })
    });
  }

  /**
   * Solicita confirmación y elimina una sesión horaria permanente.
   * @param id Identificador único de la sesión.
   */
  eliminarSesion(id: number): void {
    this.notificacionService.confirmar({
      titulo: '¿Eliminar sesión?',
      mensaje: 'Esta acción quitará este horario del taller permanentemente.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.horarioService.eliminar(id).subscribe({
          next: () => {
            this.notificacionService.mostrar({ 
              titulo: 'Eliminado', 
              mensaje: 'La sesión ha sido eliminada', 
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

  /**
   * Filtra las sesiones correspondientes a un día específico de la semana.
   * @param dia Nombre del día de la semana.
   */
  getSesionesPorDia(dia: string): HorarioResponse[] {
    return this.listaHorarios.filter(h => h.diaSemana === dia);
  }

  /**
   * Prepara y muestra el modal para añadir una sesión en un día concreto.
   * @param dia Día de la semana seleccionado.
   */
  abrirModalSesion(dia: string): void {
    this.diaSeleccionado = dia;
    this.mostrarModal = true;
  }
}