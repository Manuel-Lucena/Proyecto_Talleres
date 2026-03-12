import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenService } from '../../../services/Token.Service';
import { UsuarioService } from '../../../services/Usuario.Service';
import { UsuarioResponse } from '../../../models/Usuario.Interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  // Quitamos la inicialización fija para que se evalúe correctamente
  public isLogged = false;
  public mostrarDropdown = false;
  public usuarioData?: UsuarioResponse;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    // Verificamos el login justo al cargar
    this.isLogged = this.tokenService.isLogged();
    if (this.isLogged) {
      this.cargarDatos();
    }
  }

  private cargarDatos(): void {
    const dec = this.tokenService.decode();
    const email = dec?.sub; // Esto es "admin@admin.com" según tu consola

    if (email) {
      this.usuarioService.obtenerPorEmail(email).subscribe({
        next: (res) => {
          console.log('¡USUARIO CARGADO!', res.data);
          this.usuarioData = res.data; // Aquí ya tendrás nombre, foto, etc.
        },
        error: (err) => console.error("Error al traer datos por email", err)
      });
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