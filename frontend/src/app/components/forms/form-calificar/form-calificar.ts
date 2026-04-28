import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { ArchivoService } from '../../../services/Archivo.Service';
import { FormErrorService } from '../../../services/FormError.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE CALIFICACIONES: Formulario para la evaluación de entregas y feedback del profesor.
 */
@Component({
  selector: 'app-form-calificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-calificar.html',
  styleUrl: './form-calificar.scss'
})
export class FormCalificar implements OnInit {
  // --- Propiedades de Entrada y Salida ---
  @Input() entrega: any;                         // Datos de la entrega para calificar
  @Output() cerrar = new EventEmitter<void>();    // Notificador de cierre de modal
  @Output() guardado = new EventEmitter<void>();  // Notificador de éxito en la operación

  // --- Propiedades de Datos y UI ---
  cargando: boolean = false;                      // Flag de control para el estado de envío
  archivosAlumno: any[] = [];                     // Metadatos de los adjuntos del estudiante

  /** Estructura reactiva con reglas de evaluación */
  form = new FormGroup({
    calificacion: new FormControl('', { 
      validators: [Validators.required, Validators.min(0), Validators.max(10)], 
      updateOn: 'blur' 
    }),
    comentarioProfesor: new FormControl('', { 
      updateOn: 'blur' 
    })
  });

  /**
   * @param entregaService Operaciones de persistencia para notas y comentarios.
   * @param archivoEntregaService Obtención de referencias de archivos del alumno.
   * @param archivoService Servicio de descarga de recursos binarios.
   * @param errorService Gestor de mensajes de validación para la vista.
   * @param cdr Trigger manual para sincronizar la vista tras cargas asíncronas.
   */
  constructor(
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private archivoService: ArchivoService,
    public errorService: FormErrorService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Ciclo de vida: Inicia la carga de datos en el formulario y recupera los adjuntos del alumno.
   */
  ngOnInit(): void {
    if (this.entrega) {
      this.cargarDatosContexto();
      this.cargarArchivosAlumno();
    }
  }

  // ===========================================================================
  // --- CARGA Y CONFIGURACIÓN ---
  // ===========================================================================

  /**
   * Mapea los valores previos de la entrega a los controles del formulario.
   */
  private cargarDatosContexto(): void {
    this.form.patchValue({
      calificacion: this.entrega.calificacion?.toString() || '',
      comentarioProfesor: this.entrega.comentarioProfesor || ''
    });
  }

  /**
   * Obtiene la lista de archivos asociados a la entrega para su revisión.
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

  // ===========================================================================
  // --- GESTIÓN DE RECURSOS Y ENVÍO ---
  // ===========================================================================

  /**
   * Procesa la descarga física de archivos mediante la generación de URLs locales.
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
   * Valida la calificación y persiste los cambios en el servidor.
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