import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenService } from '../../../services/Token.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../interfaces/Usuario.Interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {

  public isLogged = false;
  public mostrarDropdown = false;
  public usuarioData?: UsuarioResponse;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Verificamos el login justo al cargar
    this.isLogged = this.tokenService.isLogged();
    if (this.isLogged) {
      this.cargarDatos();
    }
  }

  private cargarDatos(): void {
    const userId = this.tokenService.getId();

    if (userId) {
      this.usuarioService.obtenerPorId(userId).subscribe({
        next: (res) => {

          this.usuarioData = res.data;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Error en Navbar al traer datos por ID", err);
        }
      });
    } else {
      console.warn("No se pudo obtener el ID del token para el Navbar");
    }
  }

  public toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  public logout(): void {
    this.tokenService.logOut();
    this.isLogged = false;
    this.usuarioData = undefined;
    this.mostrarDropdown = false;
    this.router.navigate(['/login']);
  }
}