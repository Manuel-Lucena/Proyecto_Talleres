import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Añadimos Router
import { MaterialService } from '../../../../services/Material.Service';
import { MaterialResponse } from '../../../../interfaces/Material.Interface';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inyectamos el router
    private materialService: MaterialService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (idParam) {
      this.idTaller = Number(idParam);
      this.cargarMateriales();
    }
  }

  cargarMateriales() {
    this.cargando = true;
    this.materialService.listarPorTaller(this.idTaller).subscribe({
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