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
  contrastValue = 100;

  toggleAccessMenu() {
    this.showAccessMenu = !this.showAccessMenu;
  }

  updateContrast(event: any) {
    this.contrastValue = event.target.value;
    document.documentElement.style.setProperty('--app-contrast', `${this.contrastValue}%`);
  }

  setDaltonism(event: any) {
    const type = event.target.value;
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
    this.contrastValue = 100;
    this.showAccessMenu = false;
    document.documentElement.style.setProperty('--app-contrast', '100%');
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'font-small', 'font-medium', 'font-large');
  }
}