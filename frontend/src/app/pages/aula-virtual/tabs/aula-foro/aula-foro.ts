import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MensajeService } from '../../../../services/Mensaje.Service';
import { TokenService } from '../../../../services/Token.Service';
import { MensajeResponse, MensajeRequest } from '../../../../interfaces/Mensaje.Interface';

/**
 * Componente del Aula Virtual que gestiona el foro de discusión del taller.
 * Permite la visualización de mensajes en tiempo real y la publicación de nuevas
 * intervenciones por parte de alumnos y profesores.
 */
@Component({
  selector: 'app-aula-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aula-foro.html',
  styleUrl: './aula-foro.scss',
})
export class AulaForo implements OnInit {
  idTaller!: number; // Identificador del taller recuperado de la ruta padre
  mensajes: MensajeResponse[] = []; // Historial de mensajes del foro
  nuevoMensaje: string = ''; // Modelo vinculado al área de texto para nuevos envíos
  cargando: boolean = false; // Estado de control para la carga inicial de datos

  /**
   * @param route Acceso a parámetros de la ruta para obtener el contexto del taller.
   * @param mensajeService Servicio para la persistencia y consulta de mensajes.
   * @param tokenService Extracción de identidad del usuario desde la sesión.
   * @param cdr Referencia para la detección manual de cambios tras actualizaciones asíncronas.
   */
  constructor(
    private route: ActivatedRoute,
    private mensajeService: MensajeService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa el componente capturando el contexto del taller e iniciando la carga del foro.
   */
  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMensajes();
    }
  }

  /**
   * Recupera la lista completa de mensajes asociados al taller actual.
   */
  cargarMensajes(): void {
    this.cargando = true;
    this.mensajeService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.mensajes = resp.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Procesa y envía un nuevo mensaje al foro.
   * Al recibir confirmación, inserta el mensaje al inicio de la lista para feedback inmediato.
   */
  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) return;

    const request: MensajeRequest = {
      contenido: this.nuevoMensaje,
      idTaller: this.idTaller,
      idUsuario: this.tokenService.getId() || 0
    };

    this.mensajeService.enviar(request).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.mensajes.unshift(resp.data); 
          this.nuevoMensaje = '';
          this.cdr.detectChanges();
        }
      }
    });
  }
}