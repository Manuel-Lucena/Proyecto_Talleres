import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';

/**
 * Componente de formulario para la creación y edición de talleres.
 * Permite gestionar datos básicos, asignación de profesor y carga de imagen.
 */
@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  providers: [DatePipe],
  templateUrl: './form-taller.html',
  styleUrl: './form-taller.scss'
})
export class FormTaller implements OnInit {
  @Input() tallerParaEditar: any = null; // Datos del taller en modo edición
  @Input() profesores: UsuarioResponse[] = []; // Listado de profesores disponibles
  @Output() guardado = new EventEmitter<FormData>(); // Emite el FormData al padre
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal

  tallerForm!: FormGroup; // Instancia del formulario reactivo
  fotoPreview: string | null = null; // URL para la previsualización de la imagen
  archivoSeleccionado: File | null = null; // Referencia al archivo físico seleccionado

  /**
   * @param fb Constructor de formularios reactivos.
   * @param datePipe Utilidad para formatear fechas del backend al input date.
   * @param errorService Servicio para la gestión de errores en el template.
   */
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public errorService: FormErrorService
  ) {
    this.initForm();
  }

  /**
   * Inicializa el formulario y mapea los datos si existe un taller para editar.
   */
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

  /**
   * Define la estructura y validaciones del formulario.
   */
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

  /**
   * Gestiona la selección de imagen y genera su previsualización.
   * @param event Evento de selección de archivos.
   */
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

  /**
   * Valida el formulario y construye el FormData para el envío multiparte.
   */
  enviar() {
    if (this.tallerForm.invalid) {
      this.tallerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formValues = this.tallerForm.value;

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