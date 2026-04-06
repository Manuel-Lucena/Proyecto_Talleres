import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';

@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  providers: [DatePipe],
  templateUrl: './form-taller.html',
  styleUrl: './form-taller.scss'
})
export class FormTaller implements OnInit {
  @Input() tallerParaEditar: any = null;
  @Input() profesores: UsuarioResponse[] = [];
  @Output() guardado = new EventEmitter<FormData>();
  @Output() cerrar = new EventEmitter<void>();

  tallerForm!: FormGroup;
  fotoPreview: string | null = null;
  archivoSeleccionado: File | null = null;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public errorService: FormErrorService
  ) {
    this.initForm();
  }

ngOnInit(): void {
  if (this.tallerParaEditar) {
    const fechaInicioFormateada = this.datePipe.transform(this.tallerParaEditar.fechaInicio, 'yyyy-MM-dd');
    const fechaFinFormateada = this.datePipe.transform(this.tallerParaEditar.fechaFin, 'yyyy-MM-dd');

  
    const profesorEncontrado = this.profesores.find(p => 
      (`${p.nombre} ${p.apellidos}`) === this.tallerParaEditar.nombreCompletoProfesor
    );

  
    const idProfesorAsignado = profesorEncontrado ? profesorEncontrado.idUsuario : null;

    this.tallerForm.patchValue({
      nombre: this.tallerParaEditar.nombre,
      descripcion: this.tallerParaEditar.descripcion,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada,
      plazasMaximas: this.tallerParaEditar.plazasMaximas,
      precio: this.tallerParaEditar.precio,
      idProfesor: idProfesorAsignado
    });

    if (this.tallerParaEditar.fotoRuta) {
      this.fotoPreview = '/talleres/' + this.tallerParaEditar.fotoRuta;
    }
  }
}

  private initForm() {
    this.tallerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      plazasMaximas: [20, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      idProfesor: [null]
    }, {
      validators: [Validator.validarFechas]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  enviar() {
    if (this.tallerForm.invalid) {
      this.tallerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formValues = this.tallerForm.value;

    // Preparamos el objeto para el DTO de Java
    const tallerData: any = {
      nombre: formValues.nombre,
      descripcion: formValues.descripcion,
      plazasMaximas: formValues.plazasMaximas,
      precio: formValues.precio,
      fechaInicio: formValues.fechaInicio,
      fechaFin: formValues.fechaFin,
      idProfesor: formValues.idProfesor ? Number(formValues.idProfesor) : null
    };



    const tallerBlob = new Blob([JSON.stringify(tallerData)], {
      type: 'application/json'
    });

    formData.append('taller', tallerBlob, 'taller.json');

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    }

    this.guardado.emit(formData);
  }
}