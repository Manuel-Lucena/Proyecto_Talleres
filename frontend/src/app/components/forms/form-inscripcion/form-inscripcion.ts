import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TokenService } from '../../../services/Token.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';

/**
 * GESTOR DE INSCRIPCIONES: Formulario para el registro de usuarios y pagos en talleres.
 */
@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-inscripcion.html',
  styleUrl: './form-inscripcion.scss'
})
export class FormInscripcion implements OnInit {
  // --- Propiedades de Entrada y Salida ---
  @Input() tallerParaInscribir: TallerResponse | null = null; // Taller seleccionado para nueva inscripción
  @Input() inscripcionParaEditar: any = null;                // Datos de carga para edición (Admin)
  @Output() guardado = new EventEmitter<any>();              // Emite los datos procesados al padre
  @Output() cerrar = new EventEmitter<void>();                // Notifica el cierre del modal

  // --- Propiedades de Estado ---
  inscripcionForm!: FormGroup;                                // Instancia del formulario reactivo
  cargando: boolean = false;                                  // Estado de carga para el proceso de envío

  /**
   * @param fb Constructor de la estructura de controles.
   * @param tokenService Proveedor de identidad del usuario actual.
   */
  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService
  ) {
    this.initForm();
  }

  /**
   * Ciclo de vida: Configura los datos iniciales del formulario según el contexto recibido.
   */
  ngOnInit(): void {
    this.cargarDatosContexto();
  }

  // ===========================================================================
  // --- CONFIGURACIÓN Y CARGA ---
  // ===========================================================================

  /**
   * Define la estructura y reglas de validación del formulario.
   */
  private initForm(): void {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

  /**
   * Mapea la información del taller o la inscripción existente a los controles.
   */
  private cargarDatosContexto(): void {
    if (this.tallerParaInscribir) {
      this.inscripcionForm.patchValue({
        idUsuario: this.tokenService.getId(),
        idTaller: this.tallerParaInscribir.idTaller,
        montoPagado: this.tallerParaInscribir.precio,
        orderId: 'PAY-' + Math.random().toString(36).toUpperCase().substring(2, 10)
      });
    } else if (this.inscripcionParaEditar) {
      this.inscripcionForm.patchValue(this.inscripcionParaEditar);
    }
  }

  // ===========================================================================
  // --- LÓGICA DE NEGOCIO Y ENVÍO ---
  // ===========================================================================

  /**
   * Genera una referencia de transacción aleatoria con prefijo de inscripción.
   */
  generarOrderId(): void {
    const code = 'INS-' + Math.random().toString(36).toUpperCase().substring(2, 10);
    this.inscripcionForm.patchValue({ orderId: code });
  }

  /**
   * Valida la integridad de la inscripción y emite el objeto para su procesamiento.
   * Activa el estado de carga para indicar el proceso de envío (email/registro).
   */
  enviar(): void {
    if (this.inscripcionForm.valid) {
      this.cargando = true; 
      this.guardado.emit(this.inscripcionForm.value);
    }
  }
}