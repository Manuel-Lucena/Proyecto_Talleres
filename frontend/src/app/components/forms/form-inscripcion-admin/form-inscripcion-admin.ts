import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TallerService } from '../../../services/Taller.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE INSCRIPCIONES MANUALES: Formulario para la matriculación administrativa de alumnos.
 */
@Component({
  selector: 'app-form-inscripcion-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormLabel],
  templateUrl: './form-inscripcion-admin.html',
  styleUrl: './form-inscripcion-admin.scss'
})
export class FormInscripcionAdmin implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() tallerParaInscribir: any = null;  // Taller preseleccionado por contexto
  @Input() usuarioParaInscribir: any = null; // Alumno preseleccionado por contexto
  @Output() guardado = new EventEmitter<any>(); // Emisión de datos de inscripción al padre
  @Output() cerrar = new EventEmitter<void>();   // Notificador de cierre de modal

  // --- Propiedades de Datos y UI ---
  inscripcionForm!: FormGroup;               // Instancia del formulario reactivo
  usuarios: UsuarioResponse[] = [];          // Listado de alumnos para el selector
  talleres: TallerResponse[] = [];           // Listado de talleres para el selector

  /**
   * @param fb Constructor de la estructura de controles.
   * @param tallerService Servicio para la obtención del catálogo de talleres.
   * @param usuarioService Servicio para la gestión y filtrado de alumnos.
   */
  constructor(
    private fb: FormBuilder,
    private tallerService: TallerService,
    private usuarioService: UsuarioService
  ) {
    this.initForm();
  }

  /**
   * Ciclo de vida: Carga los datos maestros, aplica el contexto de entrada y genera el ID de orden.
   */
  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.aplicarContexto();
    this.generarOrderId();
  }

  // ===========================================================================
  // --- CONFIGURACIÓN Y CARGA ---
  // ===========================================================================

  /**
   * Inicializa la estructura del formulario con sus reglas de validación.
   */
  private initForm(): void {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

  /**
   * Carga desde la API los listados necesarios para los selectores si no vienen predefinidos.
   */
  private cargarDatosIniciales(): void {
    if (!this.tallerParaInscribir) {
      this.tallerService.listarTodos().subscribe({
        next: (res) => this.talleres = res.data
      });
    }

    if (!this.usuarioParaInscribir) {
      this.usuarioService.listarPorRol(3).subscribe({
        next: (res) => {
          this.usuarios = res.data.filter(u => u.nombreRol === 'ALUMNO');
        },
        error: (err) => console.error('ERROR: Fallo al cargar alumnos', err)
      });
    }
  }

  /**
   * Mapea los valores recibidos por Input directamente a los controles del formulario.
   */
  private aplicarContexto(): void {
    if (this.tallerParaInscribir) {
      this.inscripcionForm.patchValue({
        idTaller: this.tallerParaInscribir.idTaller,
        montoPagado: this.tallerParaInscribir.precio
      });
    }

    if (this.usuarioParaInscribir) {
      this.inscripcionForm.patchValue({
        idUsuario: this.usuarioParaInscribir.idUsuario
      });
    }
  }

  // ===========================================================================
  // --- LÓGICA DE NEGOCIO Y ENVÍO ---
  // ===========================================================================

  /**
   * Genera una referencia de pago única con prefijo administrativo.
   */
  generarOrderId(): void {
    const randomSuffix = Math.random().toString(36).toUpperCase().substring(2, 10);
    this.inscripcionForm.patchValue({ 
      orderId: 'ADM-' + randomSuffix 
    });
  }

  /**
   * Valida la integridad del formulario y emite los datos para su persistencia.
   */
  enviar(): void {
    if (this.inscripcionForm.valid) {
      this.guardado.emit(this.inscripcionForm.value);
    }
  }
}