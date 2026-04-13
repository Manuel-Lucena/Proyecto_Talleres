import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../../services/Material.Service';
import { MaterialResponse } from '../../../../interfaces/Material.Interface';
import { TokenService } from '../../../../services/Token.Service';

/**
 * Componente del Aula Virtual para la gestión y listado de materiales didácticos.
 * Filtra los recursos disponibles basándose en el rol del usuario, permitiendo a los
 * profesores ver todo el contenido y a los alumnos solo el material publicado.
 */
@Component({
  selector: 'app-aula-materiales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-materiales.html',
  styleUrl: './aula-materiales.scss'
})
export class AulaMateriales implements OnInit {
  idTaller!: number; // Identificador del taller obtenido de la ruta padre
  materiales: MaterialResponse[] = []; // Colección de recursos didácticos recuperados
  cargando: boolean = true; // Estado de carga para la visualización de la interfaz
  esProfesor: boolean = false; // Flag de permisos derivado del rol del usuario

  /**
   * @param route Acceso a la configuración de la ruta para obtener parámetros contextuales.
   * @param router Gestión de navegación hacia la vista detallada del material.
   * @param materialService Operaciones de consulta de materiales educativos.
   * @param tokenService Servicio de decodificación de JWT para validación de roles.
   * @param cdr Referencia para la detección de cambios manual en flujos asíncronos.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente determinando el nivel de acceso y capturando el ID del taller.
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

  /**
   * Solicita al servidor los materiales del taller utilizando el endpoint 
   * correspondiente según los privilegios del usuario.
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
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Navega hacia la vista de detalle de un material específico.
   * @param idMaterial Identificador único del recurso seleccionado.
   */
  verDetalle(idMaterial: number): void {
    this.router.navigate(['../detalle', 'material', idMaterial], {
      relativeTo: this.route
    });
  }
}