import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-label.html',
  styleUrl: './form-label.scss',
})
export class FormLabel {
  
  // 1. PROPIEDADES DE TEXTO Y REFERENCIA
  @Input() texto: string = '';       // Texto principal de la etiqueta
  @Input() forId: string = '';       // Vinculación con el ID del input (accesibilidad)

  // 2. INDICADORES VISUALES
  @Input() requerido: boolean = false; // Muestra el asterisco (*) si el campo es obligatorio
  @Input() ayuda: string = '';         // Texto adicional o tooltip informativo
  
}