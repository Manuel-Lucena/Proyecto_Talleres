import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { ArchivoService } from '../../../services/Archivo.Service';

@Component({
  selector: 'app-form-calificar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-calificar.html',
  styleUrl: './form-calificar.scss'
})
export class FormCalificar implements OnInit {
  @Input() entrega: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  cargando = false;
  archivosAlumno: any[] = [];

  constructor(
    private fb: FormBuilder,
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private archivoService: ArchivoService,
    private cdr: ChangeDetectorRef // Crucial para que los archivos se vean al llegar
  ) {
    this.form = this.fb.group({
      calificacion: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      comentarioProfesor: ['']
    });
  }

  ngOnInit() {
    if (this.entrega) {
      this.form.patchValue({
        calificacion: this.entrega.calificacion,
        comentarioProfesor: this.entrega.comentarioProfesor
      });
      this.cargarArchivosAlumno();
    }
  }

  cargarArchivosAlumno() {
    const id = this.entrega.idEntrega || this.entrega.id;
    if (!id) return;

    this.archivoEntregaService.listarPorEntrega(id).subscribe({
      next: (resp) => {
        this.archivosAlumno = resp.data || [];
        // Forzamos el refresco de la vista
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Error al cargar archivos:", err)
    });
  }

  descargarArchivo(archivo: any) {
    this.archivoService.obtenerBlob('entrega', archivo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivo.nombre;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  guardarNota() {
    if (this.form.invalid) return;
    this.cargando = true;

    const id = this.entrega.idEntrega || this.entrega.id;
    this.entregaService.calificar(id, this.form.value).subscribe({
      next: () => {
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}