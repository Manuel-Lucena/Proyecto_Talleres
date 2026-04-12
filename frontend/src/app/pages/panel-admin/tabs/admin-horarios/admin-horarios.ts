import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HorarioResponse, HorarioRequest } from '../../../../interfaces/Horario.Interface';
import { FormHorario } from "../../../../components/forms/form-horario/form-horario";
import { HorarioService } from '../../../../services/Horario.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service'; // Importante
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion"; // Selector
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion"; // Selector

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormHorario, Confirmacion, Notificacion], 
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios implements OnInit {
  tallerId!: number;
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  listaHorarios: HorarioResponse[] = [];

  mostrarModal = false;
  diaSeleccionado = '';

  constructor(
    private route: ActivatedRoute,
    private horarioService: HorarioService,
    private notificacionService: NotificacionService, // Inyectamos el servicio
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tallerId = Number(params['id']);
      this.cargarHorarios();
    });
  }

  cargarHorarios() {
    this.horarioService.listarPorTaller(this.tallerId).subscribe({
      next: (resp) => {
        this.listaHorarios = [...(resp.data || [])];
        this.cdr.detectChanges();
      }
    });
  }

  ejecutarGuardado(datosDelForm: any) {
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

  eliminarSesion(id: number) {
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

  getSesionesPorDia(dia: string): HorarioResponse[] {
    return this.listaHorarios.filter(h => h.diaSemana === dia);
  }

  abrirModalSesion(dia: string) {
    this.diaSeleccionado = dia;
    this.mostrarModal = true;
  }
}