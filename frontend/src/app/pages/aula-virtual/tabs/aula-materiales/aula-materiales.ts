import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../../services/Material.Service';
import { MaterialResponse } from '../../../../interfaces/Material.Interface';
import { TokenService } from '../../../../services/Token.Service'; // Importante

@Component({
  selector: 'app-aula-materiales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-materiales.html',
  styleUrl: './aula-materiales.scss'
})
export class AulaMateriales implements OnInit {
  idTaller!: number;
  materiales: MaterialResponse[] = [];
  cargando: boolean = true;
  esProfesor: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private tokenService: TokenService, // Inyectamos el servicio de tokens
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Detectamos el rol
    const rol = this.tokenService.getRol();
    this.esProfesor = (rol === 'PROFESOR' || rol === 'ADMIN');

    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMateriales();
    }
  }

  cargarMateriales() {
    this.cargando = true;

    // Elegimos endpoint según rol
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

  verDetalle(idMaterial: number) {
    this.router.navigate(['../detalle', 'material', idMaterial], {
      relativeTo: this.route
    });
  }
}