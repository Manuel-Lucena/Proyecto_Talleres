import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showAccessMenu = false;
  isDarkMode = false;
  contrastValue = 100;

  toggleAccessMenu() {
    this.showAccessMenu = !this.showAccessMenu;
  }

  toggleDarkMode(event: any) {
    this.isDarkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  updateContrast(event: any) {
    this.contrastValue = event.target.value;
    // Esto cambia la variable de 50% (bajo) a 200% (alto)
    document.documentElement.style.setProperty('--app-contrast', `${this.contrastValue}%`);
  }

  setDaltonism(event: any) {
    const type = event.target.value;
    // Eliminamos todas las posibles clases de daltonismo
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (type !== 'none') {
      document.body.classList.add(type);
    }
  }

  changeFontSize(size: 'small' | 'medium' | 'large') {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
  }

  resetAll() {
    this.isDarkMode = false;
    this.contrastValue = 100;
    this.showAccessMenu = false;
    document.documentElement.style.setProperty('--app-contrast', '100%');
    document.body.className = ''; // Limpia todas las clases (dark-mode, font, daltonismo)
  }
}