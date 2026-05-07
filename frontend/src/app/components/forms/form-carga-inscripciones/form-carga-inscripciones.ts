import { Component, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';
import { InscripcionService } from '../../../services/Inscripcion.Service';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

/** Interface interna para el manejo de estados de validación en la tabla dinámica */
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
 * GESTOR DE INSCRIPCIONES MASIVAS: 
 * Componente para la carga por lotes de alumnos mediante archivos CSV, 
 * con motor de validación en tiempo real y corrección dinámica.
 */
@Component({
  selector: 'app-form-carga-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, FormLabel],
  templateUrl: './form-carga-inscripciones.html',
  styleUrl: './form-carga-inscripciones.scss'
})
export class FormCargaInscripciones {
  // --- Propiedades de Entrada y Salida ---
  @Input() idTaller!: number;           // Identificador de contexto del taller de destino
  @Input() nombreTaller: string = '';   // Etiqueta descriptiva para la UI
  @Output() cerrar = new EventEmitter<void>();  // Notificador de cierre del modal
  @Output() guardado = new EventEmitter<void>(); // Callback tras persistencia exitosa

  // --- Propiedades de Estado y UI ---
  archivoNombre: string = '';           // Meta-dato visual del archivo seleccionado
  archivoFile: File | null = null;      // Referencia del archivo en memoria para lectura
  procesando: boolean = false;          // Flag de control para estados de carga (spinners)
  inscripcionesPrevia: InscripcionImportar[] = []; // Buffer de datos parseados y validados

  /**
   * @param cdr Trigger manual para asegurar la consistencia del DOM tras procesos asíncronos.
   * @param inscripcionService Abstracción de API para registros múltiples.
   * @param notificacion Servicio centralizado de feedback y diálogos de confirmación.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private inscripcionService: InscripcionService,
    private notificacion: NotificacionService
  ) { }

  // ===========================================================================
  // --- LÓGICA DE CARGA Y PARSEO ---
  // ===========================================================================

  /**
   * Captura el archivo del input y prepara la referencia para el procesamiento.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoNombre = file.name;
      this.archivoFile = file;
    }
  }

  /**
   * Ejecuta la lectura del archivo plano y dispara el motor de parseo.
   */
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

  /**
   * Motor de transformación de CSV a Objeto: segmenta líneas y valida integridad inicial.
   * @param texto Contenido crudo del archivo.
   */
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

      if (emailsVistos.has(ins.email.toLowerCase())) {
        ins.errores.push('Repetido en el archivo');
        ins.emailError = true;
      }
      emailsVistos.add(ins.email.toLowerCase());

      if (ins.errores.length === 0) ins.seleccionado = true;
      return ins;
    });
  }

  /**
   * Ejecuta las reglas de validación de identidad y financieras sobre una fila.
   */
  validarFila(ins: InscripcionImportar): void {
    ins.errores = [];
    ins.emailError = !Validator.isEmail(ins.email);
    ins.montoError = ins.monto <= 0;

    if (ins.emailError) ins.errores.push('Email inválido');
    if (ins.montoError) ins.errores.push('Monto inválido');

    if (ins.errores.length > 0) ins.seleccionado = false;
  }

  // ===========================================================================
  // --- GESTIÓN DE SELECCIÓN ---
  // ===========================================================================

  /**
   * Acción masiva para seleccionar/deseleccionar todas las filas aptas.
   */
  toggleTodos(event: any): void {
    const check = event.target.checked;
    this.inscripcionesPrevia.forEach(i => {
      if (i.errores.length === 0) i.seleccionado = check;
    });
  }

  /** Determina si el conjunto completo de filas válidas está marcado */
  todosSeleccionados(): boolean {
    const validos = this.inscripcionesPrevia.filter(i => i.errores.length === 0);
    return validos.length > 0 && validos.every(i => i.seleccionado);
  }

  /** Control para el estado "indeterminado" del checkbox de cabecera */
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

  // ===========================================================================
  // --- PERSISTENCIA Y FEEDBACK ---
  // ===========================================================================

  /**
   * Orquesta el proceso de envío masivo tras confirmación del usuario.
   * Incluye gestión de errores detallada para identificar filas problemáticas desde el backend.
   */
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
              } else if (msg.toLowerCase().includes('no encontrado') || msg.toLowerCase().includes('no existe')) {
                i.errores = ['El usuario no existe'];
                i.emailError = true;
              } else {
                i.errores = ['Error en esta fila'];
                i.emailError = true;
              }
            }
          });
        }

        this.notificacion.mostrar({ titulo: 'Error de Validación', mensaje: msg, tipo: 'error' });
        this.cdr.detectChanges();
      }
    });
  }
}