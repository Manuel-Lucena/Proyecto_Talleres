import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NoticiaResponse } from '../../../interfaces/Noticia.Interface';
import { FormErrorService } from '../../../services/FormError.Service';

/**
 * Componente de formulario para la creación y edición de noticias.
 */
@Component({
  selector: 'app-form-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-noticia.html',
  styleUrl: './form-noticia.scss',
})
export class FormNoticia implements OnInit {
  @Input() noticiaParaEditar: NoticiaResponse | null = null; // Datos de la noticia en modo edición
  @Output() noticiaGuardada = new EventEmitter<FormData>(); // Emite el FormData al componente padre
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal

  imagenPreview: string | ArrayBuffer | null = null; // URL temporal para la vista previa de la imagen
  fileSeleccionado: File | null = null; // Referencia al archivo de imagen seleccionado

  /** Estructura del formulario reactivo con validaciones de longitud */
  form = new FormGroup({
    titulo: new FormControl('', { 
      validators: [Validators.required, Validators.minLength(5)], 
      updateOn: 'blur' 
    }),
    contenido: new FormControl('', { 
      validators: [Validators.required], 
      updateOn: 'blur' 
    }),
  });

  /**
   * @param cdr Servicio para forzar la detección de cambios al cargar imágenes.
   * @param errorService Servicio para gestionar la visualización de errores en el template.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    public errorService: FormErrorService
  ) { }

  /**
   * Inicializa el formulario y la vista previa si se recibe una noticia para editar.
   */
  ngOnInit(): void {
    if (this.noticiaParaEditar) {
      this.form.patchValue({
        titulo: this.noticiaParaEditar.titulo,
        contenido: this.noticiaParaEditar.contenido
      });

      if (this.noticiaParaEditar.imagenUrl) {
        this.imagenPreview = `/noticias/${this.noticiaParaEditar.imagenUrl}`;
      }
      this.cdr.detectChanges();
    }
  }

  /**
   * Procesa el archivo seleccionado y genera una previsualización en base64.
   * @param event Evento de selección de archivos.
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
   * Valida el formulario y construye el FormData con el DTO y el archivo.
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

    formData.append('noticia', new Blob([JSON.stringify(noticiaDTO)], {
      type: 'application/json'
    }));

    if (this.fileSeleccionado) {
      formData.append('archivo', this.fileSeleccionado);
    }

    this.noticiaGuardada.emit(formData);
  }

  /**
   * Emite el evento de cierre del formulario.
   */
  cerrarModal() {
    this.cerrar.emit();
  }
}