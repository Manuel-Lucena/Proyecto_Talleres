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
// ... (imports iguales)

export class FormInscripcionAdmin implements OnInit {
  @Input() tallerParaInscribir: any = null; 
  @Input() usuarioParaInscribir: any = null; // IMPORTANTE: Que el padre pase {idUsuario, email}
  
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
    // Si venimos desde un Taller
    if (this.tallerParaInscribir) {
      this.inscripcionForm.patchValue({
        idTaller: this.tallerParaInscribir.idTaller,
        montoPagado: this.tallerParaInscribir.precio
      });
    }

    // Si venimos desde un Alumno (ESTO ARREGLA TU PROBLEMA)
    if (this.usuarioParaInscribir) {
      this.inscripcionForm.patchValue({
        idUsuario: this.usuarioParaInscribir.idUsuario
      });
    }
  }

  cargarDatosIniciales() {
    if (!this.tallerParaInscribir) {
      this.tallerService.listarTodos().subscribe(res => this.talleres = res.data);
    }
    if (!this.usuarioParaInscribir) {
      this.usuarioService.listar().subscribe(res => this.usuarios = res.data);
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