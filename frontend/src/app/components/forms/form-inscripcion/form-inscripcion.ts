import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TokenService } from '../../../services/Token.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';

/**
 * Componente de formulario para la inscripción de usuarios en talleres.
 */
@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-inscripcion.html',
  styleUrl: './form-inscripcion.scss'
})
export class FormInscripcion implements OnInit {
  @Input() tallerParaInscribir: TallerResponse | null = null; // Taller seleccionado para nueva inscripción
  @Input() inscripcionParaEditar: any = null; // Datos de inscripción en modo edición (Admin)
  
  @Output() guardado = new EventEmitter<any>(); // Emite los datos para procesar el pago/inscripción
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal

  inscripcionForm!: FormGroup; // Instancia del formulario reactivo

  /**
   * @param fb Constructor de formularios reactivos.
   * @param tokenService Servicio para obtener el ID del usuario actual.
   */
  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService
  ) {
    this.initForm();
  }

  /**
   * Inicializa el formulario con datos del taller o de una inscripción existente.
   */
  ngOnInit(): void {
    if (this.tallerParaInscribir) {
      this.inscripcionForm.patchValue({
        idUsuario: this.tokenService.getId(),
        idTaller: this.tallerParaInscribir.idTaller,
        montoPagado: this.tallerParaInscribir.precio,
        orderId: 'PAY-' + Math.random().toString(36).toUpperCase().substring(2, 10)
      });
    } 
    else if (this.inscripcionParaEditar) {
      this.inscripcionForm.patchValue(this.inscripcionParaEditar);
    }
  }

  /**
   * Define la estructura y validaciones iniciales del formulario.
   */
  private initForm() {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

  /**
   * Valida y emite los datos del formulario hacia el componente padre.
   */
  enviar() {
    if (this.inscripcionForm.valid) {
      this.guardado.emit(this.inscripcionForm.value);
    }
  }

  /**
   * Genera un código de orden aleatorio para la transacción.
   */
  generarOrderId() {
    const code = 'INS-' + Math.random().toString(36).toUpperCase().substring(2, 10);
    this.inscripcionForm.patchValue({ orderId: code });
  }
}