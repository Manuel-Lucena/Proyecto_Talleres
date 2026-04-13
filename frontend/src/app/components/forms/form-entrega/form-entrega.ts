import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { TokenService } from '../../../services/Token.Service';
import { lastValueFrom } from 'rxjs';

/**
 * Componente para la creación y edición de entregas de tareas por parte del alumno.
 */
@Component({
  selector: 'app-form-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-entrega.html',
  styleUrl: './form-entrega.scss'
})
export class FormEntrega implements OnInit {
  @Input() recurso: any; // La tarea actual
  @Input() entregaExistente: any = null; // Datos de entrega previa
  @Input() archivosExistentes: any[] = []; // Archivos ya subidos

  @Output() guardado = new EventEmitter<void>(); // Notifica éxito en la operación
  @Output() cerrar = new EventEmitter<void>(); // Notifica cierre del formulario

  textoEntrega: string = ''; // Cuerpo de texto de la entrega
  nuevosArchivos: File[] = []; // Archivos seleccionados para subir
  paraEliminar: number[] = []; // IDs de archivos marcados para borrar
  cargando = false; // Estado de procesamiento

  /**
   * @param entregaService Operaciones de persistencia de entregas.
   * @param archivoEntregaService Gestión de archivos asociados a entregas.
   * @param tokenService Acceso a los datos del usuario autenticado.
   */
  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private tokenService: TokenService
  ) {}

  /**
   * Inicializa el texto de la entrega si existe una previa.
   */
  ngOnInit(): void {
    if (this.entregaExistente) {
      this.textoEntrega = this.entregaExistente.textoEntrega || '';
    }
  }

  /**
   * Agrega archivos seleccionados a la lista temporal de subida.
   */
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  /**
   * Elimina un archivo de la lista de nuevos archivos antes de subir.
   */
  quitarNuevo(index: number) { 
    this.nuevosArchivos.splice(index, 1); 
  }

  /**
   * Marca un archivo existente para su eliminación definitiva.
   */
  marcarEliminar(id: number) {
    this.paraEliminar.push(id);
    this.archivosExistentes = this.archivosExistentes.filter(a => a.id !== id);
  }

  /**
   * Coordina la creación/actualización de la entrega, borrado de ficheros y subida de nuevos.
   */
  async enviar() {
    const idUsuario = this.tokenService.getId();
    const idTarea = this.recurso?.idTarea || this.recurso?.id;

    if (!idUsuario || !idTarea) {
      console.error("No se puede enviar: Usuario o Tarea no identificados");
      return;
    }

    this.cargando = true;
    try {
      let idEntrega: number;

      if (this.entregaExistente) {
        idEntrega = this.entregaExistente.idEntrega;
        
        await lastValueFrom(this.entregaService.actualizar(idEntrega, { 
          textoEntrega: this.textoEntrega 
        }));

        for (const idF of this.paraEliminar) {
          await lastValueFrom(this.archivoEntregaService.eliminar(idF));
        }
      } else {
        const resp = await lastValueFrom(this.entregaService.enviar({
          idTarea: idTarea,
          idUsuario: idUsuario,
          textoEntrega: this.textoEntrega
        }));
        idEntrega = resp.data.idEntrega;
      }

      for (const file of this.nuevosArchivos) {
        await lastValueFrom(this.archivoEntregaService.guardar(idEntrega, file));
      }

      this.guardado.emit();
      this.cerrar.emit();
    } catch (e) {
      console.error("Error en la entrega", e);
    } finally {
      this.cargando = false;
    }
  }
}