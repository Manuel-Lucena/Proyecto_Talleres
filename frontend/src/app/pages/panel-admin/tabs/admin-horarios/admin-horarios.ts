import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; // <--- IMPORTANTE
import { CommonModule } from '@angular/common'; // <--- Para el @for y clases de Angular

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, RouterLink], // <--- AÑADIR AQUÍ
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios implements OnInit {
  tallerId!: number;
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Usamos params para estar seguros de capturar el ID
    this.route.params.subscribe(params => {
      this.tallerId = Number(params['id']);
    });
  }

  abrirModalSesion(dia: string) {
    console.log('Abriendo modal para el día:', dia);
  }
}