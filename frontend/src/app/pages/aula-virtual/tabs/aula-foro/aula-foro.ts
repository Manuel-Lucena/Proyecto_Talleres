import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MensajeService } from '../../../../services/Mensaje.Service';
import { TokenService } from '../../../../services/Token.Service';
import { MensajeResponse, MensajeRequest } from '../../../../interfaces/Mensaje.Interface';

/**
 * COMPONENTE DE INTERACCIÓN: Foro de Discusión.
 * * Este componente gestiona la comunicación asíncrona dentro del taller:
 * 1. Persistencia Mensajería: Implementa el envío y recuperación de intervenciones.
 * 2. Inserción Optimista: Actualiza el estado local de la lista para feedback inmediato.
 * 3. Gestión de Identidad: Vincula automáticamente cada mensaje al ID del usuario en sesión.
 */
@Component({
  selector: 'app-aula-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aula-foro.html',
  styleUrl: './aula-foro.scss',
})
export class AulaForo implements OnInit {

  // --- Propiedades de Datos ---
  idTaller!: number;                          // Identificador de contexto del taller padre
  mensajes: MensajeResponse[] = [];           // Historial cronológico de la conversación
  nuevoMensaje: string = '';                  // Buffer vinculado al Two-Way Binding del input

  // --- Propiedades de Estado y UI ---
  cargando: boolean = false;                  // Flag para el control de la hidratación inicial

  /**
   * @param route Captura de parámetros desde el contexto superior de la ruta.
   * @param mensajeService Abstracción de la API para operaciones de mensajería.
   * @param tokenService Proveedor de identidad para el tracking de autoría.
   * @param cdr Trigger manual para asegurar la consistencia del DOM tras envíos rápidos.
   */
  constructor(
    private route: ActivatedRoute,
    private mensajeService: MensajeService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Ciclo de vida: Inicializa el componente resolviendo el ID del taller mediante 
   * el parent snapshot para disparar la carga del historial.
   */
  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMensajes();
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE LA PERSISTENCIA ---
  // ===========================================================================

  /**
   * Recupera el histórico de intervenciones asociadas al taller.
   */
  cargarMensajes(): void {
    this.cargando = true;
    this.mensajeService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.mensajes = resp.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CRITICAL: Error al recuperar el historial del foro:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Procesa el envío de una nueva intervención.
   * * TÉCNICA: Se utiliza un modelo de 'unshift' tras la confirmación del servidor 
   * para inyectar el nuevo objeto en la cabecera del array sin re-petición del listado.
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
      },
      error: (err) => console.error('Error al persistir el mensaje:', err)
    });
  }
}