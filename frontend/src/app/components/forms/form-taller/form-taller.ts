import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';

@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './form-taller.html',
  styleUrl: './form-taller.scss'
})
export class FormTaller implements OnInit {
  @Input() tallerParaEditar: any = null;
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

      this.tallerForm.patchValue({
        ...this.tallerParaEditar,
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada,
        idProfesor: this.tallerParaEditar.idProfesor || 1
      });

      if (this.tallerParaEditar.fotoRuta) {
        this.fotoPreview = this.tallerParaEditar.fotoRuta;
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
      idProfesor: [1],
      nombreCompletoProfesor: ['']
    }, { 
      validators: [Validator.validarFechas],
      updateOn: 'blur' 
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
    const tallerData = { ...this.tallerForm.value };

    if (this.tallerParaEditar?.idTaller) {
      tallerData.idTaller = this.tallerParaEditar.idTaller;
    }

    delete tallerData.nombreCompletoProfesor;

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