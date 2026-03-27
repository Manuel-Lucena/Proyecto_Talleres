import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importamos DatePipe
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe], // <--- Necesario para formatear fechas
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

  constructor(private fb: FormBuilder, private datePipe: DatePipe) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.tallerParaEditar) {
      // FORMATEO OBLIGATORIO PARA HTML5 DATE INPUT
      const fechaInicioFormateada = this.datePipe.transform(this.tallerParaEditar.fechaInicio, 'yyyy-MM-dd');
      const fechaFinFormateada = this.datePipe.transform(this.tallerParaEditar.fechaFin, 'yyyy-MM-dd');

      this.tallerForm.patchValue({
        ...this.tallerParaEditar,
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada,
        idProfesor: this.tallerParaEditar.idProfesor || 1
      });

      if (this.tallerParaEditar.fotoRuta) {
        // Asegúrate de que la ruta sea accesible (ej: concatenar base URL si es necesario)
        this.fotoPreview = this.tallerParaEditar.fotoRuta;
      }
    }
  }

  private initForm() {
    this.tallerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      plazasMaximas: [20, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      idProfesor: [1],
      nombreCompletoProfesor: ['']
    });
  }

  // Añade este método dentro de la clase FormTaller
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();

      // Esto es lo que genera la miniatura que ves en la preview
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

    // Si es edición, necesitamos el ID dentro del JSON para el Backend
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