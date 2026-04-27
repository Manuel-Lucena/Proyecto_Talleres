import { Component, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';
import { InscripcionService } from '../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

interface InscripcionImportar {
  email: string;
  nombre: string;
  monto: number;
  metodoPago: string;
  seleccionado: boolean;
  errores: string[];
  emailError: boolean;
  montoError: boolean;
}

/**
 * GESTOR DE INSCRIPCIONES MASIVAS
 * Permite cargar alumnos a un taller, validar datos y corregirlos en una tabla dinámica.
 */
@Component({
  selector: 'app-form-carga-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, FormLabel],
  templateUrl: './form-carga-inscripciones.html',
  styleUrl: './form-carga-inscripciones.scss'
})
export class FormCargaInscripciones {

  @Input() idTaller!: number;
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

  // --- LÓGICA DE CARGA ---

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
    const emailsVistos = new Set<string>();

    this.inscripcionesPrevia = filasDato.map(linea => {
      const col = linea.split(',').map(c => c.trim());
      const ins: InscripcionImportar = {
        email: col[0] || '',
        nombre: col[1] || '',
        monto: Number(col[2]) || 0,
        metodoPago: col[3]?.toUpperCase() || 'TRANSFERENCIA',
        seleccionado: false,
        errores: [],
        emailError: false,
        montoError: false
      };

      this.validarFila(ins);

      // Duplicados dentro del propio archivo
      if (emailsVistos.has(ins.email.toLowerCase())) {
        ins.errores.push('Repetido en el archivo');
        ins.emailError = true;
      }
      emailsVistos.add(ins.email.toLowerCase());

      if (ins.errores.length === 0) ins.seleccionado = true;
      return ins;
    });
  }

  validarFila(ins: InscripcionImportar): void {
    ins.errores = [];
    ins.emailError = !Validator.isEmail(ins.email);
    ins.montoError = ins.monto <= 0;

    if (ins.emailError) ins.errores.push('Email inválido');
    if (ins.montoError) ins.errores.push('Monto inválido');
    if (ins.errores.length > 0) ins.seleccionado = false;
  }

  // --- LÓGICA DE SELECCIÓN ---

  toggleTodos(event: any): void {
    const check = event.target.checked;
    this.inscripcionesPrevia.forEach(i => {
      if (i.errores.length === 0) i.seleccionado = check;
    });
  }

  todosSeleccionados(): boolean {
    const validos = this.inscripcionesPrevia.filter(i => i.errores.length === 0);
    return validos.length > 0 && validos.every(i => i.seleccionado);
  }

  algunosSeleccionados(): boolean {
    const seleccionados = this.totalSeleccionados();
    const validos = this.inscripcionesPrevia.filter(i => i.errores.length === 0).length;
    return seleccionados > 0 && seleccionados < validos;
  }

  totalSeleccionados(): number {
    return this.inscripcionesPrevia.filter(i => i.seleccionado).length;
  }

  haySeleccionados(): boolean {
    return this.totalSeleccionados() > 0;
  }

  // --- PERSISTENCIA ---

  async confirmarCarga(): Promise<void> {
    const seleccionados = this.inscripcionesPrevia.filter(i => i.seleccionado);
    const ok = await this.notificacion.confirmar({
      titulo: 'Confirmar Inscripciones',
      mensaje: `¿Deseas inscribir a ${seleccionados.length} alumnos?`
    });

    if (!ok) return;
    this.procesando = true;

    const data = seleccionados.map(i => ({
      idTaller: this.idTaller,
      emailUsuario: i.email,
      montoPagado: i.monto,
      metodoPago: i.metodoPago,
      estadoPago: 'COMPLETADO'
    }));

    this.inscripcionService.inscribirVarios(data).subscribe({
      next: () => {
        this.notificacion.mostrar({ titulo: 'Éxito', mensaje: 'Importación terminada', tipo: 'exito' });
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        this.procesando = false;

        const msg = (err.error?.message || 'Error de datos');

    
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailEncontrado = msg.match(emailRegex)?.[0];

        if (emailEncontrado) {
          this.inscripcionesPrevia.forEach(i => {
            if (i.email.toLowerCase() === emailEncontrado.toLowerCase()) {

              i.seleccionado = false; 

             
              if (msg.toLowerCase().includes('registrado') || msg.toLowerCase().includes('inscripción')) {
                i.errores = ['Ya está inscrito'];
                i.emailError = true;
              }
              else if (msg.toLowerCase().includes('no encontrado') || msg.toLowerCase().includes('no existe')) {
                i.errores = ['El usuario no existe'];
                i.emailError = true;
              }
              else {
                i.errores = ['Error en esta fila'];
                i.emailError = true;
              }
            }
          });
        }

        this.notificacion.mostrar({
          titulo: 'Error de Validación',
          mensaje: msg, 
          tipo: 'error'
        });

        this.cdr.detectChanges();
      }
    });
  }
}