import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../../../../services/Tarea.Service';
import { MaterialService } from '../../../../services/Material.Service';
import { TokenService } from '../../../../services/Token.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

/**
 * COMPONENTE DE AGREGACIÓN: Muro de Actividades (Timeline).
 * * Este componente actúa como el "Feed" principal del Aula Virtual:
 * 1. Orquestación Concurrente: Utiliza forkJoin para unificar flujos de tareas y materiales.
 * 2. Normalización de Tipos: Transforma DTOs heterogéneos en un modelo unificado para la UI.
 * 3. Ordenación Cronológica: Implementa un algoritmo de clasificación por fecha descendente.
 */
@Component({
  selector: 'app-aula-muro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-muro.html',
  styleUrl: './aula-muro.scss',
})
export class AulaMuro implements OnInit {

  // --- Propiedades de Datos ---
  actividades: any[] = [];                    // Colección híbrida (Tareas + Materiales)

  // --- Propiedades de Estado y UI ---
  cargando: boolean = true;                   // Flag de control para la sincronización de flujos
  esProfesor: boolean = false;                // Determinador de privilegios para filtros de visibilidad

  /**
   * @param tareaService Consumo de la API para actividades evaluables.
   * @param materialService Consumo de la API para recursos didácticos.
   * @param tokenService Análisis del JWT para validación de claims y seguridad.
   * @param route Captura del ID del taller desde el contexto jerárquico.
   * @param cdr Sincronización manual del ciclo de vida de la vista.
   * @param router Motor de navegación para el drill-down hacia detalles.
   */
  constructor(
    private tareaService: TareaService,
    private materialService: MaterialService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Ciclo de vida: Inicializa permisos de rol y captura el identificador del taller 
   * a través del parent snapshot para refrescar del muro.
   */
  ngOnInit(): void {
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idTaller = this.route.parent?.snapshot.paramMap.get('id');
    if (idTaller) {
      this.cargarMuro(Number(idTaller));
    }
  }

  // ===========================================================================
  // --- LÓGICA DE UNIFICACIÓN Y NORMALIZACIÓN ---
  // ===========================================================================

  /**
   * Coordina la carga paralela y la fusión de recursos didácticos.
   * * Transformación de datos para inyectar un discriminador 
   * de tipo ('TAREA' vs 'MATERIAL') y una propiedad de fecha común (fechaMuro).
   */
  cargarMuro(idTaller: number): void {
    this.cargando = true;
    const idAlumno = this.tokenService.getId();

    const tareasObs = this.esProfesor 
      ? this.tareaService.listarPorTaller(idTaller) 
      : this.tareaService.listarVisibles(idTaller);

    const materialesObs = this.esProfesor 
      ? this.materialService.listarPorTaller(idTaller) 
      : this.materialService.listarVisibles(idTaller);

    forkJoin({ tareas: tareasObs, materiales: materialesObs }).subscribe({
      next: (res) => {
        const tareasMapped = res.tareas.data.map(t => ({
          ...t,
          tipo: 'TAREA',
          fechaMuro: new Date(t.fechaPublicacion || (t as any).createdAt || new Date())
        }));

        const materialesMapped = res.materiales.data.map(m => ({
          ...m,
          tipo: 'MATERIAL',
          fechaMuro: new Date((m as any).fechaSubida || (m as any).createdAt || new Date())
        }));

        this.actividades = [...tareasMapped, ...materialesMapped].sort(
          (a, b) => b.fechaMuro.getTime() - a.fechaMuro.getTime()
        );

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CRITICAL: Error en la orquestación del muro:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Redirige al detalle del recurso basándose en el discriminador de tipo.
   * Utiliza navegación relativa para mantener la consistencia del path del taller.
   */
  verDetalle(item: any): void {
    const idRecurso = item.tipo === 'TAREA' ? item.idTarea : item.id;
    const tipoUrl = item.tipo.toLowerCase();
    this.router.navigate(['../detalle', tipoUrl, idRecurso], { relativeTo: this.route });
  }
}