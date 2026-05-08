import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorService } from '../../../services/FormError.Service';
import { Validator } from '../../../validators/Validator';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';
import { FormLabel } from '../../dialogs/form-label/form-label';

/** * FORMULARIO DE TALLERES: Gestor para el alta y modificación de datos de talleres. 
 */
@Component({
  selector: 'app-form-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormLabel],
  providers: [DatePipe],
  templateUrl: './form-taller.html',
  styleUrl: './form-taller.scss'
})
export class FormTaller implements OnInit {

  // --- Propiedades de Entrada y Salida --- 
  @Input() tallerParaEditar: any = null;      // Datos para la recarga en modo edición 
  @Input() profesores: UsuarioResponse[] = []; // Listado para el selector de docentes 
  @Output() guardado = new EventEmitter<FormData>(); // Emisión de datos empaquetados al padre 
  @Output() cerrar = new EventEmitter<void>();       // Notificador de cierre de modal 

  // --- Propiedades de Estado y UI --- 
  tallerForm!: FormGroup;                    // Instancia del control reactivo 
  fotoPreview: string = '/talleres/taller_default.png';  // URL temporal para la previsualización 
  archivoSeleccionado: File | null = null;   // Referencia al archivo físico de imagen 

  /** * @param fb Constructor para la estructura de controles. 
   * @param datePipe Herramienta para formatear fechas hacia el input. 
   * @param errorService Gestor de mensajes de validación en la vista. 
   */
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public errorService: FormErrorService,
    private cd: ChangeDetectorRef
  ) {
    this.initForm();
  }

  /** 
   ** Ciclo de vida: Inicia la carga de datos en el formulario si se recibe un objeto para editar. 
   */
  ngOnInit(): void {
    if (this.tallerParaEditar) {
      this.cargarDatosEdicion();
    }
  }

  // =========================================================================== 
  // --- CONFIGURACIÓN Y CARGA --- 
  // =========================================================================== 

  /** * Define la estructura base y las reglas de validación del formulario. 
   */
  private initForm(): void {
    this.tallerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      plazasMaximas: [20, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      idProfesor: [null]
    }, { validators: [Validator.validarFechas] });
  }

  /** * Mapea los valores del taller seleccionado a los controles del formulario. 
   */
  private cargarDatosEdicion(): void {
    const fechaInicioFormateada = this.datePipe.transform(this.tallerParaEditar.fechaInicio, 'yyyy-MM-dd');
    const fechaFinFormateada = this.datePipe.transform(this.tallerParaEditar.fechaFin, 'yyyy-MM-dd');

    const profesorEncontrado = this.profesores.find(p =>
      (`${p.nombre} ${p.apellidos}`) === this.tallerParaEditar.nombreCompletoProfesor
    );

    this.tallerForm.patchValue({
      nombre: this.tallerParaEditar.nombre,
      descripcion: this.tallerParaEditar.descripcion,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada,
      plazasMaximas: this.tallerParaEditar.plazasMaximas,
      precio: this.tallerParaEditar.precio,
      idProfesor: profesorEncontrado ? profesorEncontrado.idUsuario : null
    });

    if (this.tallerParaEditar.fotoRuta) {
      this.fotoPreview = '/talleres/' + this.tallerParaEditar.fotoRuta;
    }
  }

  // =========================================================================== 
  // --- GESTIÓN DE ARCHIVOS Y ENVÍO --- 
  // =========================================================================== 

  /** * Procesa la imagen seleccionada y genera la vista previa local. 
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Obtiene el nombre completo del profesor seleccionado para la tarjeta de vista previa.
   */
  obtenerNombreProfesor(): string {
    const id = this.tallerForm.get('idProfesor')?.value;
    const prof = this.profesores.find(p => p.idUsuario === id);
    return prof ? `Prof. ${prof.nombre} ${prof.apellidos}` : '';
  }

  /** * Empaqueta los datos en un FormData para soportar la subida de archivos y emite el resultado. 
   */
  enviar(): void {
    if (this.tallerForm.invalid) {
      this.tallerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const v = this.tallerForm.value;

    const tallerData = {
      nombre: v.nombre,
      descripcion: v.descripcion,
      plazasMaximas: v.plazasMaximas,
      precio: v.precio,
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      idProfesor: v.idProfesor ? Number(v.idProfesor) : null
    };

    const tallerBlob = new Blob([JSON.stringify(tallerData)], { type: 'application/json' });
    formData.append('taller', tallerBlob, 'taller.json');

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    }

    this.guardado.emit(formData);
  }
}