import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Servicios
import { UsuarioService } from '../../../../services/Usuario.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { TareaService } from '../../../../services/Tarea.Service';
import { FormCalificar } from '../../../../components/forms/form-calificar/form-calificar';

@Component({
  selector: 'app-aula-tarea-seguimiento',
  standalone: true,
  imports: [CommonModule, FormCalificar],
  templateUrl: './aula-tarea-seguimiento.html',
  styleUrl: './aula-tarea-seguimiento.scss'
})
export class AulaTareaSeguimiento implements OnInit {
  idTaller: number = 0;
  idTarea: number = 0;
  tarea: any = null;
  cargando = true;
  filas: any[] = []; // Array de objetos genéricos

  mostrarModalCalificar = false;
  entregaSeleccionada: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private entregaService: EntregaService,
    private tareaService: TareaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Captura de IDs robusta
    this.idTarea = Number(this.route.snapshot.paramMap.get('idRecurso'));
    this.idTaller = Number(this.route.snapshot.paramMap.get('id')) ||
      Number(this.route.parent?.snapshot.paramMap.get('id'));

    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.cdr.detectChanges();

    forkJoin({
      usuarios: this.usuarioService.listarPorTaller(this.idTaller),
      entregas: this.entregaService.listarPorTarea(this.idTarea),
      tarea: this.tareaService.obtenerPorId(this.idTarea)
    }).subscribe({
      next: (res: any) => {
        this.tarea = res.tarea?.data;

        const listaUsuarios = res.usuarios?.data || [];
        const listaEntregas = res.entregas?.data || [];

        // 1. Filtramos para que SOLO aparezcan ALUMNOS
        // Usamos 'nombreRol' que es como viene en tu interfaz
        this.filas = listaUsuarios
          .filter((u: any) => u.nombreRol?.toUpperCase() === 'ALUMNO')
          .map((alumno: any) => {

            // 2. Buscamos la entrega usando 'idUsuario' en ambos lados
            // Forzamos String para evitar errores de tipo
            const entrega = listaEntregas.find((e: any) =>
              String(e.idUsuario) === String(alumno.idUsuario)
            );

            return {
              alumno: alumno,
              entrega: entrega || null,
              estado: this.definirEstado(entrega)
            };
          });

        console.log('Seguimiento procesado:', this.filas);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando seguimiento:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Asegúrate de que el botón volver use la ruta absoluta para evitar el error de Match
  volver() {
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas']);
  }

  get totalEntregados(): number {
    return this.filas.filter((f: any) => f.entrega !== null).length;
  }

  private definirEstado(entrega: any): string {
    if (!entrega) return 'PENDIENTE';
    // Si existe calificación (aunque sea 0), marcamos como calificado
    if (entrega.calificacion !== null && entrega.calificacion !== undefined) return 'CALIFICADO';
    return 'ENTREGADO';
  }

  abrirCalificador(fila: any) {
    if (fila.entrega) {
      this.entregaSeleccionada = fila.entrega;
      this.mostrarModalCalificar = true;
      this.cdr.detectChanges();
    }
  }


}