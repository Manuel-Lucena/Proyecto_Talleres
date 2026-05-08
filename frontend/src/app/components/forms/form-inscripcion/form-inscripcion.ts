import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TokenService } from '../../../services/Token.Service';
import { FormErrorService } from '../../../services/FormError.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE INSCRIPCIONES: Formulario para el registro de usuarios y pagos en talleres.
 * Integra validaciones bancarias y feedback visual mediante FormErrorService.
 */
@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-inscripcion.html',
  styleUrl: './form-inscripcion.scss'
})
export class FormInscripcion implements OnInit {
  // --- Propiedades de Entrada y Salida ---
  @Input() tallerParaInscribir: TallerResponse | null = null; // Taller seleccionado para nueva inscripción
  @Input() inscripcionParaEditar: any = null;                  // Datos de carga para edición (Admin)
  @Output() guardado = new EventEmitter<any>();                // Emite los datos procesados al padre
  @Output() cerrar = new EventEmitter<void>();                 // Notifica el cierre del modal

  // --- Propiedades de Estado ---
  inscripcionForm!: FormGroup;                                 // Instancia del formulario reactivo
  cargando: boolean = false;                                   // Estado de carga para el proceso de envío

  /**
   * @param fb Constructor de la estructura de controles.
   * @param tokenService Proveedor de identidad del usuario actual.
   * @param errorService Gestor de mensajes de validación para el template.
   */
  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    public errorService: FormErrorService
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
   * Se incluyen campos para la simulación de pasarela de pago con patrones estrictos.
   */
  private initForm(): void {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      titular: ['', [Validators.required]],
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      fechaExp: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[2-9][0-9]$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
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
        montoPagado: this.tallerParaInscribir.precio
      });
    } else if (this.inscripcionParaEditar) {
      this.inscripcionForm.patchValue(this.inscripcionParaEditar);
    }
  }

  // ===========================================================================
  // --- LÓGICA DE NEGOCIO Y ENVÍO ---
  // ===========================================================================

  /**
   * Valida la integridad de la inscripción y emite el objeto para su procesamiento.
   * Encapsula los datos de pago y la información de matrícula para la pasarela del backend.
   * Activa el estado de carga para indicar el proceso de envío (email/registro).
   */
  enviar(): void {
    if (this.inscripcionForm.valid) {
      this.cargando = true;
      const val = this.inscripcionForm.value;
      const payloadPago = {
        numeroTarjeta: val.numeroTarjeta,
        fechaExpiracion: val.fechaExp,
        cvv: val.cvv,
        titular: val.titular,
        inscripcionInfo: {
          idUsuario: val.idUsuario,
          idTaller: val.idTaller,
          montoPagado: val.montoPagado,
          orderId: ''
        }
      };
      this.guardado.emit(payloadPago);
    } else {
      this.inscripcionForm.markAllAsTouched();
    }
  }
}