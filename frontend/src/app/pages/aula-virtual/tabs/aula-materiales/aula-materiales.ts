import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../../services/Material.Service';
import { MaterialResponse } from '../../../../interfaces/Material.Interface';
import { TokenService } from '../../../../services/Token.Service';

/**
 * VISTA DE RECURSOS DIDÁCTICOS: Gestor de Materiales.
 * * Este componente gestiona la visualización de documentos y recursos del taller:
 * 1. Control de Visibilidad: Filtra el contenido según el rol (Profesor vs Alumno).
 * 2. Navegación Contextual: Implementa rutas relativas para desacoplar el detalle del recurso.
 * 3. Gestión de Estado: Sincroniza la carga asíncrona con el ciclo de vida de la UI.
 */
@Component({
  selector: 'app-aula-materiales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-materiales.html',
  styleUrl: './aula-materiales.scss'
})
export class AulaMateriales implements OnInit {

  // --- Propiedades de Datos ---
  idTaller!: number;                          // Identificador de contexto del taller padre
  materiales: MaterialResponse[] = [];        // Colección de recursos educativos recuperados

  // --- Propiedades de Estado y UI ---
  cargando: boolean = true;                   // Control de visualización para Skeleton/Loader
  esProfesor: boolean = false;                // Flag de autorización para la gestión de recursos

  /**
   * @param route Captura de parámetros desde la ruta jerárquica superior.
   * @param router Gestión de navegación hacia el detalle del material.
   * @param materialService Abstracción de la API para la entidad Material.
   * @param tokenService Análisis de claims del JWT para validación de privilegios.
   * @param cdr Trigger manual para la detección de cambios tras la respuesta del servidor.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Ciclo de vida: Establece el nivel de acceso y extrae el identificador del taller 
   * a través del parent snapshot para garantizar la carga del contexto correcto.
   */
  ngOnInit(): void {
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMateriales();
    }
  }

  // ===========================================================================
  // --- CAPA DE DATOS Y AUTORIZACIÓN ---
  // ===========================================================================

  /**
   * Ejecuta la recuperación de materiales aplicando la lógica de negocio por rol.
   * * TÉCNICA: Se utiliza una estrategia de selección de Observable para centralizar 
   * la suscripción y optimizar el manejo del flujo de datos.
   */
  cargarMateriales(): void {
    this.cargando = true;
    
    const obs = this.esProfesor 
      ? this.materialService.listarPorTaller(this.idTaller) 
      : this.materialService.listarVisibles(this.idTaller);

    obs.subscribe({
      next: (res) => {
        this.materiales = res.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CRITICAL: Error en la carga de recursos didácticos:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- NAVEGACIÓN ---
  // ===========================================================================

  /**
   * Redirige al usuario al detalle específico del recurso seleccionado.
   * Emplea 'relativeTo' para asegurar que la navegación sea coherente con la URL del taller.
   */
  verDetalle(idMaterial: number): void {
    this.router.navigate(['../detalle', 'material', idMaterial], { relativeTo: this.route });
  }
}