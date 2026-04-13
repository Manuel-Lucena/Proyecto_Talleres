import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from '../../components/layout/footer/footer';
import { TallerService } from '../../services/Taller.Service';
import { TokenService } from '../../services/Token.Service';
import { TallerResponse } from '../../interfaces/Taller.Interface';
import { HorarioTaller } from "../../components/dialogs/horario-taller/horario-taller";

/**
 * Componente para que el alumno visualice los talleres en los que está inscrito.
 * Ofrece acceso al aula virtual, materiales, tareas y consulta de horarios.
 */
@Component({
  selector: 'app-mis-talleres',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule, HorarioTaller],
  templateUrl: './mis-talleres.html',
  styleUrl: './mis-talleres.scss'
})
export class MisTalleres implements OnInit {
  talleres: TallerResponse[] = []; // Colección de talleres asociados al alumno
  cargando: boolean = true; // Flag de control para el estado de carga de la interfaz

  mostrarModalHorario: boolean = false; // Control de visibilidad del diálogo de horarios
  idTallerSeleccionado!: number; // ID del taller para la consulta de horarios
  nombreTallerSeleccionado: string = ''; // Nombre del taller para el encabezado del modal

  /**
   * @param tallerService Servicio para la recuperación de talleres por usuario.
   * @param tokenService Gestión de identidad para obtener el ID del usuario actual.
   * @param router Servicio de navegación hacia el aula virtual.
   * @param cdr Detección manual de cambios para asegurar la actualización de la UI.
   */
  constructor(
    private tallerService: TallerService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente recuperando la identidad del usuario y sus talleres.
   */
  ngOnInit(): void {
    const idUsuario = this.tokenService.getId();
    if (idUsuario) {
      this.cargarMisTalleres(Number(idUsuario));
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Solicita al servidor la lista de talleres donde el usuario figura como alumno.
   * @param id Identificador único del usuario.
   */
  cargarMisTalleres(id: number): void {
    this.cargando = true;
    this.tallerService.listarPorUsuario(id).subscribe({
      next: (resp) => {
        this.talleres = resp.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando talleres", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Activa el modal de horario configurando el contexto del taller seleccionado.
   * @param item Objeto del taller del cual se desea ver la planificación.
   */
  verHorario(item: TallerResponse): void {
    this.idTallerSeleccionado = item.idTaller;
    this.nombreTallerSeleccionado = item.nombre;
    this.mostrarModalHorario = true;
    this.cdr.detectChanges();
  }

  /**
   * Navega a la vista principal del aula virtual del taller.
   * @param idTaller Identificador del taller.
   */
  entrarAlAula(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller]);
  }

  /**
   * Navega directamente a la sección de tareas del taller.
   * @param idTaller Identificador del taller.
   */
  verTareas(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller, 'tareas']);
  }

  /**
   * Navega directamente a la sección de materiales y recursos del taller.
   * @param idTaller Identificador del taller.
   */
  verRecursos(idTaller: number): void {
    this.router.navigate(['/aula-virtual', idTaller, 'recursos']);
  }
}