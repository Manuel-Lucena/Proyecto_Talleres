import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NoticiaResponse } from '../../../models/Noticia.Interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-noticia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-noticia.html',
  styleUrl: './form-noticia.scss',
})
export class FormNoticia implements OnInit, OnDestroy {
  @Input() noticiaParaEditar: NoticiaResponse | null = null;
  @Output() noticiaGuardada = new EventEmitter<FormData>();
  @Output() cerrar = new EventEmitter<void>();

  imagenPreview: string | ArrayBuffer | null = null;
  fileSeleccionado: File | null = null;
  private formSub: Subscription | undefined;

  form = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(5)]),
    contenido: new FormControl('', [Validators.required]),
  });

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Suscripción para cambios de texto
    this.formSub = this.form.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });

    if (this.noticiaParaEditar) {
      this.form.patchValue({
        titulo: this.noticiaParaEditar.titulo,
        contenido: this.noticiaParaEditar.contenido
      });

      if (this.noticiaParaEditar.imagenUrl) {
        // Si están en public/noticias/, la ruta es esta:
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
      // ¡AÑADE ESTA LÍNEA! Mantiene la imagen actual si no se selecciona una nueva
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

  ngOnDestroy(): void {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}