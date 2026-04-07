import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator'; // <--- Importas tu clase

@Component({
  selector: 'app-form-horario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-horario.html',
  styleUrl: './form-horario.scss',
})
export class FormHorario implements OnInit {
  @Input() tallerId!: number;
  @Input() diaPreseleccionado: string = 'Lunes';
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  form = new FormGroup({
    diaSemana: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    fechaFin: new FormControl('', { validators: [Validators.required], updateOn: 'blur' })
  }, { 
    validators: [Validator.validarFechas] // <--- USAMOS TU MÉTODO ESTÁTICO
  });

  constructor(public errorService: FormErrorService) {}

  ngOnInit(): void {
    this.form.patchValue({ diaSemana: this.diaPreseleccionado });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Mapeamos los nombres de vuelta a lo que espera tu HorarioRequest si es necesario
    const data = {
      diaSemana: this.form.value.diaSemana,
      horaInicio: this.form.value.fechaInicio,
      horaFin: this.form.value.fechaFin
    };

    this.guardado.emit(data);
  }
}