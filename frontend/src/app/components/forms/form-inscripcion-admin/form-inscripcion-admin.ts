import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select'; 
import { TallerService } from '../../../services/Taller.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';

/**
 * Componente de formulario para que el administrador gestione inscripciones manualmente.
 */
@Component({
  selector: 'app-form-inscripcion-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './form-inscripcion-admin.html',
  styleUrl: './form-inscripcion-admin.scss'
})
export class FormInscripcionAdmin implements OnInit {
  @Input() tallerParaInscribir: any = null; // Taller preseleccionado por contexto
  @Input() usuarioParaInscribir: any = null; // Alumno preseleccionado por contexto
  
  @Output() guardado = new EventEmitter<any>(); // Emite los datos de la nueva inscripción
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal

  inscripcionForm!: FormGroup; // Formulario reactivo de inscripción
  usuarios: UsuarioResponse[] = []; // Listado de alumnos disponibles
  talleres: TallerResponse[] = []; // Listado de talleres disponibles

  /**
   * @param fb Constructor de formularios reactivos.
   * @param tallerService Servicio para la obtención de talleres.
   * @param usuarioService Servicio para la gestión de usuarios/alumnos.
   */
  constructor(
    private fb: FormBuilder,
    private tallerService: TallerService,
    private usuarioService: UsuarioService
  ) {
    this.initForm();
  }

  /**
   * Ejecuta la carga de datos maestros, aplica el contexto recibido y genera el ID de orden.
   */
  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.aplicarContexto();
    this.generarOrderId();
  }

  /**
   * Inicializa la estructura del formulario con sus validaciones básicas.
   */
  private initForm() {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

  /**
   * Aplica al formulario los valores recibidos mediante @Input si existen.
   */
  private aplicarContexto() {
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

  /**
   * Carga desde la API los talleres y alumnos necesarios para los selectores.
   */
  cargarDatosIniciales() {
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
        error: (err) => console.error('Error al cargar alumnos', err)
      });
    }
  }

  /**
   * Genera un identificador de orden único con prefijo administrativo.
   */
  generarOrderId() {
    this.inscripcionForm.patchValue({ 
      orderId: 'ADM-' + Math.random().toString(36).toUpperCase().substring(2, 10) 
    });
  }

  /**
   * Valida y emite los datos hacia el componente padre.
   */
  enviar() {
    if (this.inscripcionForm.valid) {
      this.guardado.emit(this.inscripcionForm.value);
    }
  }
}