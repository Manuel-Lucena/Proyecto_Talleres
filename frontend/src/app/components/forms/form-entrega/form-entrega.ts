import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { TokenService } from '../../../services/Token.Service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-form-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-entrega.html',
  styleUrl: './form-entrega.scss'
})
export class FormEntrega implements OnInit {
  @Input() recurso: any; // La tarea actual
  @Input() entregaExistente: any = null;
  @Input() archivosExistentes: any[] = [];

  @Output() guardado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  textoEntrega: string = '';
  nuevosArchivos: File[] = [];
  paraEliminar: number[] = [];
  cargando = false;

  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    if (this.entregaExistente) {
      this.textoEntrega = this.entregaExistente.textoEntrega || '';
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  quitarNuevo(index: number) { 
    this.nuevosArchivos.splice(index, 1); 
  }

  marcarEliminar(id: number) {
    this.paraEliminar.push(id);
    this.archivosExistentes = this.archivosExistentes.filter(a => a.id !== id);
  }

  async enviar() {
    const idUsuario = this.tokenService.getId();
    const idTarea = this.recurso?.idTarea || this.recurso?.id;

    // Validación para evitar el error de "number | null"
    if (!idUsuario || !idTarea) {
      console.error("No se puede enviar: Usuario o Tarea no identificados");
      return;
    }

    this.cargando = true;
    try {
      let idEntrega: number;

      if (this.entregaExistente) {
        idEntrega = this.entregaExistente.idEntrega;
        
        // 1. Actualizar texto (Usamos casting 'as number' por si el servicio es muy estricto)
        await lastValueFrom(this.entregaService.actualizar(idEntrega, { 
          textoEntrega: this.textoEntrega 
        }));

        // 2. Borrar archivos marcados
        for (const idF of this.paraEliminar) {
          await lastValueFrom(this.archivoEntregaService.eliminar(idF));
        }
      } else {
        // 3. Nueva entrega (Aquí idUsuario e idTarea ya son seguros)
        const resp = await lastValueFrom(this.entregaService.enviar({
          idTarea: idTarea,
          idUsuario: idUsuario,
          textoEntrega: this.textoEntrega
        }));
        idEntrega = resp.data.idEntrega;
      }

      // 4. Subir nuevos archivos
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