import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select'; 
import { TallerService } from '../../../services/Taller.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';

@Component({
  selector: 'app-form-inscripcion-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './form-inscripcion-admin.html',
  styleUrl: './form-inscripcion-admin.scss'
})
export class FormInscripcionAdmin implements OnInit {
  @Input() tallerParaInscribir: any = null; 
  @Input() usuarioParaInscribir: any = null; 
  
  @Output() guardado = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

  inscripcionForm!: FormGroup;
  usuarios: UsuarioResponse[] = [];
  talleres: TallerResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private tallerService: TallerService,
    private usuarioService: UsuarioService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.aplicarContexto();
    this.generarOrderId();
  }

  private initForm() {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

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

  cargarDatosIniciales() {
    // Carga de talleres si no vienen por contexto
    if (!this.tallerParaInscribir) {
      this.tallerService.listarTodos().subscribe({
        next: (res) => this.talleres = res.data
      });
    }

    // Carga de usuarios filtrados por Rol 3 (Alumnos)
    if (!this.usuarioParaInscribir) {
      this.usuarioService.listarPorRol(3).subscribe({
        next: (res) => {
          // Filtramos en el cliente para asegurar que solo pasen los que tengan nombreRol 'ALUMNO'
          this.usuarios = res.data.filter(u => u.nombreRol === 'ALUMNO');
        },
        error: (err) => console.error('Error al cargar alumnos', err)
      });
    }
  }

  generarOrderId() {
    this.inscripcionForm.patchValue({ 
      orderId: 'ADM-' + Math.random().toString(36).toUpperCase().substring(2, 10) 
    });
  }

  enviar() {
    if (this.inscripcionForm.valid) {
      this.guardado.emit(this.inscripcionForm.value);
    }
  }
}