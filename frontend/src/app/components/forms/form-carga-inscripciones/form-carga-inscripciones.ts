import { Component, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';
import { InscripcionService } from '../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../services/Notificacion.Service';

interface InscripcionImportar {
  email: string;
  nombre: string; // Opcional, para visualizar
  monto: number;
  metodoPago: string;
  seleccionado: boolean;
  errores: string[];
  emailError: boolean;
  montoError: boolean;
}

@Component({
  selector: 'app-form-carga-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-carga-inscripciones.html',
  styleUrl: './form-carga-inscripciones.scss'
})
export class FormCargaInscripciones {
  @Input() idTaller!: number; // Recibimos el taller destino
  @Input() nombreTaller: string = '';

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  archivoNombre: string = '';
  archivoFile: File | null = null;
  procesando: boolean = false;
  inscripcionesPrevia: InscripcionImportar[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private inscripcionService: InscripcionService,
    private notificacion: NotificacionService
  ) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoNombre = file.name;
      this.archivoFile = file;
    }
  }

  procesarArchivo(): void {
    if (!this.archivoFile) return;
    this.procesando = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.parsearCSV(e.target.result);
      this.procesando = false;
      this.cdr.detectChanges();
    };
    reader.readAsText(this.archivoFile);
  }

  private parsearCSV(texto: string): void {
    const lineas = texto.split(/\r?\n/);
    const filasDato = lineas.slice(1).filter(l => l.trim() !== '');

    this.inscripcionesPrevia = filasDato.map(linea => {
      const columnas = linea.split(',').map(c => c.trim());
      const ins: InscripcionImportar = {
        email: columnas[0] || '',
        nombre: columnas[1] || '',
        monto: Number(columnas[2]) || 0,
        metodoPago: columnas[3] || 'TRANSFERENCIA',
        seleccionado: false,
        errores: [],
        emailError: false,
        montoError: false
      };
      this.validarFila(ins);
      if (ins.errores.length === 0) ins.seleccionado = true;
      return ins;
    });
  }

  validarFila(ins: InscripcionImportar): void {
    ins.errores = [];
    ins.emailError = !Validator.isEmail(ins.email);
    ins.montoError = ins.monto <= 0;

    if (ins.emailError) ins.errores.push('Email inválido');
    if (ins.montoError) ins.errores.push('Monto debe ser > 0');
    if (!ins.metodoPago) ins.errores.push('Falta método de pago');

    if (ins.errores.length > 0) ins.seleccionado = false;
  }
  haySeleccionados(): boolean {
    return this.totalSeleccionados() > 0;
  }

  totalSeleccionados(): number {
    return this.inscripcionesPrevia.filter(i => i.seleccionado).length;
  }

  async confirmarCarga(): Promise<void> {
    const seleccionados = this.inscripcionesPrevia.filter(i => i.seleccionado);
    const ok = await this.notificacion.confirmar({
      titulo: 'Confirmar Inscripciones',
      mensaje: `¿Deseas inscribir a ${seleccionados.length} alumnos en el taller ${this.nombreTaller}?`
    });

    if (!ok) return;

    this.procesando = true;
    // Formateamos los datos para el backend
    const data = seleccionados.map(i => ({
      idTaller: this.idTaller,
      emailUsuario: i.email,
      montoPagado: i.monto,
      metodoPago: i.metodoPago,
      estadoPago: 'COMPLETADO'
    }));

    this.inscripcionService.inscribirVarios(data).subscribe({
      next: () => {
        this.notificacion.mostrar({ titulo: 'Éxito', mensaje: 'Inscripciones masivas completadas.', tipo: 'exito' });
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        this.procesando = false;
        this.notificacion.mostrar({
          titulo: 'Error',
          mensaje: err.error?.message || 'Error en la carga masiva.',
          tipo: 'error'
        });
        this.cdr.detectChanges();
      }
    });
  }
}