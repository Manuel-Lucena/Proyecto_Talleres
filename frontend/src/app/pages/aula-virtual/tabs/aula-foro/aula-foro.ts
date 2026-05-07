import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // Importación necesaria para evitar el deprecated
import { MensajeService } from '../../../../services/Mensaje.Service';
import { TokenService } from '../../../../services/Token.Service';
import { MensajeResponse, MensajeRequest } from '../../../../interfaces/Mensaje.Interface';
import { NotificacionService } from '../../../../services/Notificacion.Service';

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
  cargando: boolean = false;                  // Flag para el control de la carga inicial

  /**
   * @param route Captura de parámetros desde el contexto superior de la ruta.
   * @param mensajeService Abstracción de la API para operaciones de mensajería.
   * @param tokenService Proveedor de identidad para el tracking de autoría.
   * @param cdr Trigger manual para asegurar la consistencia del DOM tras envíos rápidos.
   * @param notify Servicio centralizado para feedback visual.
   */
  constructor(
    private route: ActivatedRoute,
    private mensajeService: MensajeService,
    public tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private notify: NotificacionService,
  ) { }

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
   * * Se utiliza un modelo de 'unshift' tras la confirmación del servidor 
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

  // ===========================================================================
  // --- GESTIÓN DE ELIMINACIÓN CON MODALES ---
  // ===========================================================================

  /**
   * Elimina un mensaje individual tras confirmación del usuario.
   */
  async eliminarMensaje(idMensaje: number): Promise<void> {
    const confirmar = await this.notify.confirmar({
      titulo: 'Eliminar Mensaje',
      mensaje: '¿Estás seguro de que deseas borrar este mensaje? Esta acción no se puede deshacer.'
    });

    if (confirmar) {
      this.mensajeService.eliminar(idMensaje).subscribe({
        next: () => {
          this.mensajes = this.mensajes.filter(m => m.idMensaje !== idMensaje);
          this.notify.mostrar({
            titulo: 'Eliminado',
            mensaje: 'El mensaje ha sido borrado correctamente.',
            tipo: 'exito'
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notify.mostrar({
            titulo: 'Error',
            mensaje: 'No se pudo eliminar el mensaje.',
            tipo: 'error'
          });
          console.error(err);
        }
      });
    }
  }

  /**
   * Limpia el foro completo (Solo para personal de gestión).
   */
  async limpiarForo(): Promise<void> {
    const confirmar = await this.notify.confirmar({
      titulo: 'Limpiar Foro Completo',
      mensaje: 'Vas a borrar TODOS los mensajes de este taller. ¿Estás totalmente seguro?'
    });

    if (confirmar) {
      this.cargando = true;
      const promesasBorrado = this.mensajes.map(m => firstValueFrom(this.mensajeService.eliminar(m.idMensaje)));

      try {
        await Promise.all(promesasBorrado);
        
        this.mensajes = []; 
        this.notify.mostrar({
          titulo: 'Foro Limpio',
          mensaje: 'Se han eliminado todos los mensajes del taller.',
          tipo: 'exito'
        });
      } catch (error) {
        this.notify.mostrar({
          titulo: 'Error parcial',
          mensaje: 'Algunos mensajes no pudieron eliminarse. Recarga la página.',
          tipo: 'error'
        });
        this.cargarMensajes();
      } finally {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    }
  }
}