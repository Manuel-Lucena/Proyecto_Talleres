import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  showAccessMenu = false;
  contrastValue = 100;

  currentDaltonism = 'none';
  currentFontSize = 'medium';

  ngOnInit() {
    this.loadSettings();
  }

  get modalActive(): boolean {
    return !!document.querySelector('.modal-overlay');
  }

  toggleAccessMenu() {
    this.showAccessMenu = !this.showAccessMenu;
  }

  // --- LÓGICA DE CARGA ---
  private loadSettings() {
    // Cargar Contraste
    const savedContrast = localStorage.getItem('accessibility-contrast');
    if (savedContrast) {
      this.contrastValue = Number(savedContrast);
      this.applyContrast(this.contrastValue);
    }

    // Cargar Daltonismo
    const savedDaltonism = localStorage.getItem('accessibility-daltonism');
    if (savedDaltonism) {
      this.currentDaltonism = savedDaltonism;
      if (savedDaltonism !== 'none') {
        document.body.classList.add(savedDaltonism);
      }
    }

    // Cargar Tamaño de fuente
    const savedFont = localStorage.getItem('accessibility-font');
    if (savedFont) {
      this.currentFontSize = savedFont.replace('font-', '');
      document.body.classList.add(savedFont);
    }
  }

  // --- MÉTODOS DE ACTUALIZACIÓN ---

  updateContrast(event: any) {
    this.contrastValue = event.target.value;
    this.applyContrast(this.contrastValue);
    localStorage.setItem('accessibility-contrast', this.contrastValue.toString());
  }

  private applyContrast(value: number) {
    document.documentElement.style.setProperty('--app-contrast', `${value}%`);
  }

  setDaltonism(event: any) {
    this.currentDaltonism = event.target.value;
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    
    if (this.currentDaltonism !== 'none') {
      document.body.classList.add(this.currentDaltonism);
    }
    localStorage.setItem('accessibility-daltonism', this.currentDaltonism);
  }

  changeFontSize(size: 'small' | 'medium' | 'large') {
    this.currentFontSize = size;
    const fontClass = `font-${size}`;
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(fontClass);
    localStorage.setItem('accessibility-font', fontClass);
  }

  resetAll() {
    this.contrastValue = 100;
    this.currentDaltonism = 'none';
    this.currentFontSize = 'medium';
    this.showAccessMenu = false;
    
    this.applyContrast(100);
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'font-small', 'font-medium', 'font-large');

    // Limpiar localStorage
    localStorage.removeItem('accessibility-contrast');
    localStorage.removeItem('accessibility-daltonism');
    localStorage.removeItem('accessibility-font');
  }
}