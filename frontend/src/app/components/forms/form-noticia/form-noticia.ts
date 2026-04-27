import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NoticiaResponse } from '../../../interfaces/Noticia.Interface';
import { FormErrorService } from '../../../services/FormError.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * FORMULARIO DE NOTICIAS: Gestor para la creación y edición de entradas informativas.
 */
@Component({
  selector: 'app-form-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-noticia.html',
  styleUrl: './form-noticia.scss',
})
export class FormNoticia implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() noticiaParaEditar: NoticiaResponse | null = null; // Datos para la carga en modo edición
  @Output() noticiaGuardada = new EventEmitter<FormData>();  // Emisión de datos hacia el padre
  @Output() cerrar = new EventEmitter<void>();                // Notificador de cierre de modal

  // --- Propiedades de Estado y UI ---
  imagenPreview: string | ArrayBuffer | null = null; // Vista previa de la imagen seleccionada
  fileSeleccionado: File | null = null;              // Archivo físico en memoria para el envío

  /** Estructura reactiva con reglas de validación */
  form = new FormGroup({
    titulo: new FormControl('', { validators: [Validators.required, Validators.minLength(5)], updateOn: 'blur' }),
    contenido: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
  });

  /**
   * @param cdr Trigger manual para asegurar la paridad de la vista tras cargar archivos.
   * @param errorService Gestor de mensajes de validación para el template.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    public errorService: FormErrorService
  ) { }

  /**
   * Ciclo de vida: Inicia el mapeo de datos si se recibe una noticia para editar.
   */
  ngOnInit(): void {
    if (this.noticiaParaEditar) {
      this.cargarDatosEdicion();
    }
  }

  // ===========================================================================
  // --- CARGA Y CONFIGURACIÓN ---
  // ===========================================================================

  /**
   * Traslada los valores de la noticia seleccionada a los controles del formulario.
   */
  private cargarDatosEdicion(): void {
    this.form.patchValue({
      titulo: this.noticiaParaEditar?.titulo,
      contenido: this.noticiaParaEditar?.contenido
    });

    if (this.noticiaParaEditar?.imagenUrl) {
      this.imagenPreview = `/noticias/${this.noticiaParaEditar.imagenUrl}`;
    }
    this.cdr.detectChanges();
  }

  // ===========================================================================
  // --- GESTIÓN DE ARCHIVOS Y ENVÍO ---
  // ===========================================================================

  /**
   * Procesa la imagen seleccionada y genera la previsualización local.
   * @param event Evento del input de archivos.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Empaqueta el DTO y el archivo en un FormData para el envío multiparte.
   */
  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const noticiaDTO = {
      idNoticia: this.noticiaParaEditar?.idNoticia || null,
      titulo: this.form.value.titulo,
      contenido: this.form.value.contenido,
      imagenUrl: this.noticiaParaEditar?.imagenUrl || null
    };

    formData.append('noticia', new Blob([JSON.stringify(noticiaDTO)], { type: 'application/json' }));

    if (this.fileSeleccionado) {
      formData.append('archivo', this.fileSeleccionado);
    }

    this.noticiaGuardada.emit(formData);
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Solicita el cierre del componente.
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }
}