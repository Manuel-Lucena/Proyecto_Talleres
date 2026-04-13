import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';

/**
 * Componente de formulario para la creación y edición de horarios de talleres.
 */
@Component({
  selector: 'app-form-horario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-horario.html',
  styleUrl: './form-horario.scss',
})
export class FormHorario implements OnInit {
  @Input() tallerId!: number; // ID del taller al que pertenece el horario
  @Input() diaPreseleccionado: string = 'Lunes'; // Día por defecto al abrir el formulario
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal
  @Output() guardado = new EventEmitter<any>(); // Emite los datos del horario para su persistencia

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']; // Opciones de la semana

  /**
   * Estructura del formulario reactivo con validación personalizada de rango horario.
   */
  form = new FormGroup({
    diaSemana: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    fechaFin: new FormControl('', { validators: [Validators.required], updateOn: 'blur' })
  }, { 
    validators: [Validator.validarFechas] 
  });

  /**
   * @param errorService Servicio para la gestión de mensajes de error en los campos.
   */
  constructor(public errorService: FormErrorService) {}

  /**
   * Inicializa el formulario aplicando el día de la semana preseleccionado.
   */
  ngOnInit(): void {
    this.form.patchValue({ diaSemana: this.diaPreseleccionado });
  }

  /**
   * Valida el formulario y emite los datos del horario hacia el componente padre.
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