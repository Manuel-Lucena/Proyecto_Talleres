import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.tallerParaEditar) {
      // Importante: Si las fechas vienen como objeto Date o String largo, 
      // el input type="date" necesita formato YYYY-MM-DD
      this.tallerForm.patchValue({
        ...this.tallerParaEditar,
        idProfesor: this.tallerParaEditar.idProfesor || 1 // Valor por defecto o el que venga
      });
      
      if (this.tallerParaEditar.fotoRuta) {
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
      idProfesor: [1], // <--- ESTO ES LO QUE NECESITA TU JAVA
      nombreCompletoProfesor: [''] // Solo para mostrar en la preview
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => this.fotoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  enviar() {
    if (this.tallerForm.invalid) return;

    const formData = new FormData();
    const tallerData = { ...this.tallerForm.value };


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