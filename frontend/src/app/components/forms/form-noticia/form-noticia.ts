import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NoticiaResponse } from '../../../interfaces/Noticia.Interface';
import { FormErrorService } from '../../../services/FormError.Service';

@Component({
  selector: 'app-form-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-noticia.html',
  styleUrl: './form-noticia.scss',
})
export class FormNoticia implements OnInit {
  @Input() noticiaParaEditar: NoticiaResponse | null = null;
  @Output() noticiaGuardada = new EventEmitter<FormData>();
  @Output() cerrar = new EventEmitter<void>();

  imagenPreview: string | ArrayBuffer | null = null;
  fileSeleccionado: File | null = null;

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

  constructor(
    private cdr: ChangeDetectorRef,
    public errorService: FormErrorService // Inyectado para el HTML
  ) { }

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

  cerrarModal() {
    this.cerrar.emit();
  }
}