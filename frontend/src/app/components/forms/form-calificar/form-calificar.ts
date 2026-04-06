import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { ArchivoService } from '../../../services/Archivo.Service';
import { FormErrorService } from '../../../services/FormError.Service';

@Component({
  selector: 'app-form-calificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-calificar.html',
  styleUrl: './form-calificar.scss'
})
export class FormCalificar implements OnInit {
  @Input() entrega: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  cargando = false;
  archivosAlumno: any[] = [];

  form = new FormGroup({
    calificacion: new FormControl('', { 
      validators: [Validators.required, Validators.min(0), Validators.max(10)], 
      updateOn: 'blur' 
    }),
    comentarioProfesor: new FormControl('', { updateOn: 'blur' })
  });

  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private archivoService: ArchivoService,
    public errorService: FormErrorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.entrega) {
      this.form.patchValue({
        calificacion: this.entrega.calificacion?.toString() || '',
        comentarioProfesor: this.entrega.comentarioProfesor || ''
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
        this.cdr.detectChanges(); 
      }
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const idEntrega = this.entrega.idEntrega || this.entrega.id;
    const raw = this.form.getRawValue();

    // CONSTRUCCIÓN DEL BODY PARA EVITAR ERRORES DE TIPO
    const body: any = {
      idTarea: this.entrega.idTarea,
      idUsuario: this.entrega.idUsuario,
      calificacion: Number(raw.calificacion), // Convertimos a número
      comentarioProfesor: raw.comentarioProfesor || ''
    };

    this.entregaService.calificar(idEntrega, body).subscribe({
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