import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MensajeService } from '../../../../services/Mensaje.Service';
import { TokenService } from '../../../../services/Token.Service';
import { MensajeResponse, MensajeRequest } from '../../../../interfaces/Mensaje.Interface';

@Component({
  selector: 'app-aula-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aula-foro.html',
  styleUrl: './aula-foro.scss',
})
export class AulaForo implements OnInit {
  idTaller!: number;
  mensajes: MensajeResponse[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private mensajeService: MensajeService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtenemos el ID del taller desde la ruta padre (aula-virtual/:id)
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMensajes();
    }
  }

  cargarMensajes(): void {
    this.cargando = true;
    this.mensajeService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.mensajes = resp.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) return;

    const request: MensajeRequest = {
      contenido: this.nuevoMensaje,
      idTaller: this.idTaller,
      idUsuario: this.tokenService.getId() || 0
    };

    this.mensajeService.enviar(request).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.mensajes.unshift(resp.data); 
          this.nuevoMensaje = '';
          this.cdr.detectChanges();
        }
      }
    });
  }
}