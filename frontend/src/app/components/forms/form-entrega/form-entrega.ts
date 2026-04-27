import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { TokenService } from '../../../services/Token.Service';
import { lastValueFrom } from 'rxjs';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE ENTREGAS: Formulario para la subida de tareas, gestión de archivos y textos del alumno.
 */
@Component({
  selector: 'app-form-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-entrega.html',
  styleUrl: './form-entrega.scss'
})
export class FormEntrega implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() recurso: any;                         // Contexto de la tarea actual
  @Input() entregaExistente: any = null;          // Datos para la carga en modo edición
  @Input() archivosExistentes: any[] = [];        // Listado de ficheros ya persistidos
  @Output() guardado = new EventEmitter<void>();  // Notificador de éxito en la operación
  @Output() cerrar = new EventEmitter<void>();    // Notificador de cierre de modal

  // --- Propiedades de Datos y UI ---
  textoEntrega: string = '';                      // Cuerpo de texto de la respuesta
  nuevosArchivos: File[] = [];                    // Buffer temporal de ficheros a subir
  paraEliminar: number[] = [];                    // Registro de IDs marcados para borrado
  cargando: boolean = false;                      // Flag de control para el estado de envío

  /**
   * @param entregaService Operaciones de persistencia para la entidad Entrega.
   * @param archivoEntregaService Gestión del almacenamiento de ficheros asociados.
   * @param tokenService Proveedor de identidad del alumno autenticado.
   */
  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private tokenService: TokenService
  ) {}

  /**
   * Ciclo de vida: Inicia la carga del texto de entrega si existe una versión previa.
   */
  ngOnInit(): void {
    if (this.entregaExistente) {
      this.textoEntrega = this.entregaExistente.textoEntrega || '';
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE ARCHIVOS ---
  // ===========================================================================

  /**
   * Sincroniza la selección del input file con la lista temporal de subida.
   */
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  /**
   * Elimina un fichero del listado de nuevas cargas antes de procesar el envío.
   */
  quitarNuevo(index: number): void {
    this.nuevosArchivos.splice(index, 1);
  }

  /**
   * Registra un archivo persistido para su eliminación definitiva tras confirmar el envío.
   */
  marcarEliminar(id: number): void {
    this.paraEliminar.push(id);
    this.archivosExistentes = this.archivosExistentes.filter(a => a.id !== id);
  }

  // ===========================================================================
  // --- PROCESAMIENTO Y ENVÍO ---
  // ===========================================================================

  /**
   * Coordina el flujo de persistencia: actualización de texto, borrado de archivos y subida de nuevos.
   */
  async enviar(): Promise<void> {
    const idUsuario = this.tokenService.getId();
    const idTarea = this.recurso?.idTarea || this.recurso?.id;

    if (!idUsuario || !idTarea) {
      console.error("ERROR: No se puede enviar; falta identificación de Usuario o Tarea");
      return;
    }

    this.cargando = true;

    try {
      let idEntrega: number;

      if (this.entregaExistente) {
        // Flujo de Actualización
        idEntrega = this.entregaExistente.idEntrega;
        await lastValueFrom(this.entregaService.actualizar(idEntrega, { textoEntrega: this.textoEntrega }));
        
        for (const idF of this.paraEliminar) {
          await lastValueFrom(this.archivoEntregaService.eliminar(idF));
        }
      } else {
        // Flujo de Creación Inicial
        const resp = await lastValueFrom(this.entregaService.enviar({ 
          idTarea: idTarea, 
          idUsuario: idUsuario, 
          textoEntrega: this.textoEntrega 
        }));
        idEntrega = resp.data.idEntrega;
      }

      // Procesamiento de nuevos ficheros adjuntos
      for (const file of this.nuevosArchivos) {
        await lastValueFrom(this.archivoEntregaService.guardar(idEntrega, file));
      }

      this.guardado.emit();
      this.cerrar.emit();

    } catch (e) {
      console.error("CRITICAL: Fallo en el proceso de entrega", e);
    } finally {
      this.cargando = false;
    }
  }
}