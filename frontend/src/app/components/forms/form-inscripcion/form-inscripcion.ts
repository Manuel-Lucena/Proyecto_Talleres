import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TokenService } from '../../../services/Token.Service';
import { TallerResponse } from '../../../interfaces/Taller.Interface';

@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-inscripcion.html',
  styleUrl: './form-inscripcion.scss'
})
export class FormInscripcion implements OnInit {
  @Input() tallerParaInscribir: TallerResponse | null = null; 
  @Input() inscripcionParaEditar: any = null; 
  
  @Output() guardado = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

  inscripcionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.tallerParaInscribir) {
      this.inscripcionForm.patchValue({
        idUsuario: this.tokenService.getId(),
        idTaller: this.tallerParaInscribir.idTaller,
        montoPagado: this.tallerParaInscribir.precio,
        orderId: 'PAY-' + Math.random().toString(36).toUpperCase().substring(2, 10)
      });
    } 
    // Caso 2: Admin está editando una inscripción existente
    else if (this.inscripcionParaEditar) {
      this.inscripcionForm.patchValue(this.inscripcionParaEditar);
    }
  }

  private initForm() {
    this.inscripcionForm = this.fb.group({
      idUsuario: [null, [Validators.required]],
      idTaller: [null, [Validators.required]],
      montoPagado: [0, [Validators.required, Validators.min(0)]],
      orderId: ['', [Validators.required]]
    });
  }

  enviar() {
    if (this.inscripcionForm.valid) {
      this.guardado.emit(this.inscripcionForm.value);
    }
  }

  generarOrderId() {
    const code = 'INS-' + Math.random().toString(36).toUpperCase().substring(2, 10);
    this.inscripcionForm.patchValue({ orderId: code });
  }
}