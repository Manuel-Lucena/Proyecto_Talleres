import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE HORARIOS: Formulario para la planificación de sesiones semanales en talleres.
 */
@Component({
  selector: 'app-form-horario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-horario.html',
  styleUrl: './form-horario.scss',
})
export class FormHorario implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() tallerId!: number;                 // ID del taller para el vínculo de persistencia
  @Input() diaPreseleccionado: string = 'Lunes'; // Valor inicial para el selector de día
  @Output() cerrar = new EventEmitter<void>();   // Notificador de cierre para el modal
  @Output() guardado = new EventEmitter<any>();  // Emisión de los datos del horario al padre

  // --- Propiedades de Datos y UI ---
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  /** Estructura reactiva con validación de rango horario */
  form = new FormGroup({
    diaSemana: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    fechaFin: new FormControl('', { validators: [Validators.required], updateOn: 'blur' })
  }, { 
    validators: [Validator.validarFechas] 
  });

  /**
   * @param errorService Gestor de mensajes de validación para la interfaz.
   */
  constructor(public errorService: FormErrorService) {}

  /**
   * Ciclo de vida: Configura el estado inicial del formulario aplicando el día recibido por Input.
   */
  ngOnInit(): void {
    this.form.patchValue({ diaSemana: this.diaPreseleccionado });
  }

  // ===========================================================================
  // --- LÓGICA DE NEGOCIO Y ENVÍO ---
  // ===========================================================================

  /**
   * Valida la integridad del horario y emite el objeto procesado para su guardado.
   */
  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = {
      diaSemana: this.form.value.diaSemana,
      horaInicio: this.form.value.fechaInicio,
      horaFin: this.form.value.fechaFin
    };

    this.guardado.emit(data);
  }
}