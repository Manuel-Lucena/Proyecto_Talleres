import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Footer } from "../../components/layout/footer/footer";
import { NoticiaService } from '../../services/Noticia.Service';
import { TokenService } from '../../services/Token.Service';
import { NoticiaResponse } from '../../models/Noticia.Interface';
import { FormNoticia } from '../../components/forms/form-noticia/form-noticia';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Navbar, CommonModule, Footer, FormNoticia],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  listaNoticias: NoticiaResponse[] = [];
  noticiaSeleccionada: NoticiaResponse | null = null;
  mostrarModal: boolean = false;

  constructor(
    private noticiaService: NoticiaService,
    public tokenService: TokenService,
    private cdr: ChangeDetectorRef // Inyectamos esto para evitar los "universos paralelos"
  ) { }

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.noticiaService.listar().subscribe({
      next: (res) => {
        // Usamos el spread operator [...] para asegurar que Angular detecte el cambio de referencia
        this.listaNoticias = [...res.data.slice(0, 6)];
        this.cdr.detectChanges(); // Forzamos a la vista a despertar
      },
      error: (err) => console.error('Error al cargar:', err)
    });
  }

  abrirCrear() {
    this.noticiaSeleccionada = null;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirEditar(noticia: NoticiaResponse) {
    // Usamos JSON parse/stringify para romper CUALQUIER relación con el objeto de la lista
    // Así, si el formulario "trastea" con el objeto, la card de la landing ni se entera
    this.noticiaSeleccionada = JSON.parse(JSON.stringify(noticia));
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  onPublicarNoticia(datos: FormData): void {
    const accion = this.noticiaSeleccionada
      ? this.noticiaService.actualizar(this.noticiaSeleccionada.idNoticia, datos)
      : this.noticiaService.crear(datos);

    accion.subscribe({
      next: () => {
        this.cerrarModal();

      
        setTimeout(() => {
          this.cargarNoticias();
        }, 800);
      },
      error: (err) => console.error("Error al guardar:", err)
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.noticiaSeleccionada = null;
    this.cdr.detectChanges();
  }
}