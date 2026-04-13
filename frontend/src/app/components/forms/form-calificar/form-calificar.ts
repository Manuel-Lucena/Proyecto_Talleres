import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { ArchivoService } from '../../../services/Archivo.Service';
import { FormErrorService } from '../../../services/FormError.Service';

/**
 * Componente para la calificación de entregas de tareas por parte del profesor.
 */
@Component({
  selector: 'app-form-calificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-calificar.html',
  styleUrl: './form-calificar.scss'
})
export class FormCalificar implements OnInit {
  
  @Input() entrega: any; // Datos de la entrega a calificar
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal
  @Output() guardado = new EventEmitter<void>(); // Notifica éxito en la persistencia

  cargando = false; // Estado de carga para feedback visual
  archivosAlumno: any[] = []; // Archivos adjuntos del alumno

  /** Estructura del formulario con validaciones */
  form = new FormGroup({
    calificacion: new FormControl('', { 
      validators: [Validators.required, Validators.min(0), Validators.max(10)], 
      updateOn: 'blur' 
    }),
    comentarioProfesor: new FormControl('', { updateOn: 'blur' })
  });

  /**
   * @param entregaService Operaciones para calificar entregas.
   * @param archivoEntregaService Listado de metadatos de archivos.
   * @param archivoService Descarga física de archivos (Blobs).
   * @param errorService Gestión de errores en el template.
   * @param cdr Detección de cambios para actualizaciones asíncronas.
   */
  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private archivoService: ArchivoService,
    public errorService: FormErrorService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Carga los datos iniciales de la entrega y recupera los archivos adjuntos.
   */
  ngOnInit(): void {
    if (this.entrega) {
      this.form.patchValue({
        calificacion: this.entrega.calificacion?.toString() || '',
        comentarioProfesor: this.entrega.comentarioProfesor || ''
      });
      this.cargarArchivosAlumno();
    }
  }

  /**
   * Obtiene la lista de archivos subidos por el alumno.
   */
  cargarArchivosAlumno(): void {
    const id = this.entrega.idEntrega || this.entrega.id;
    if (!id) return;
    this.archivoEntregaService.listarPorEntrega(id).subscribe({
      next: (resp) => {
        this.archivosAlumno = resp.data || [];
        this.cdr.detectChanges(); 
      }
    });
  }

  /**
   * Gestiona la descarga de archivos convirtiéndolos en URL local.
   * @param archivo Metadatos del archivo a descargar.
   */
  descargarArchivo(archivo: any): void {
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

  /**
   * Valida y envía la calificación al servidor.
   */
  guardarNota(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const idEntrega = this.entrega.idEntrega || this.entrega.id;
    const raw = this.form.getRawValue();

    const body: any = {
      idTarea: this.entrega.idTarea,
      idUsuario: this.entrega.idUsuario,
      calificacion: Number(raw.calificacion),
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