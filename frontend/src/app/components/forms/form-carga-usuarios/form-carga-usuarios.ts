import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';

interface UsuarioImportar {
  nombre: string;
  apellidos: string;
  email: string;
  rol: 'Alumno' | 'Profesor';
  seleccionado: boolean;
  errores: string[];
  emailError: boolean;
}

@Component({
  selector: 'app-form-carga-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-carga-usuarios.html',
  styleUrl: './form-carga-usuarios.scss'
})
export class FormCargaUsuarios {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any[]>();

  // Estado de la UI
  archivoNombre: string = '';
  archivoFile: File | null = null;
  fase: 'subida' | 'previa' = 'subida';
  procesando: boolean = false;

  // Datos de la tabla
  usuariosPrevia: UsuarioImportar[] = [];

  constructor() { }

  /**
   * Captura el archivo del input
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoNombre = file.name;
      this.archivoFile = file;
    }
  }

  /**
   * Lee el contenido del CSV y lo transforma en objetos editables
   */
  procesarArchivo(): void {
    if (!this.archivoFile) return;

    this.procesando = true;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const contenido = e.target.result;
      this.parsearCSV(contenido);

      this.fase = 'previa';
      this.procesando = false;
    };

    reader.onerror = () => {
      alert('Error al leer el archivo');
      this.procesando = false;
    };

    // Leemos el archivo como texto plano
    reader.readAsText(this.archivoFile);
  }

  /**
   * Convierte el texto plano del CSV en el array para la tabla
   */
  private parsearCSV(texto: string): void {
    const lineas = texto.split(/\r?\n/);

    // Filtramos líneas vacías y saltamos la cabecera (primera línea)
    const filasDato = lineas.slice(1).filter(l => l.trim() !== '');

    this.usuariosPrevia = filasDato.map(linea => {
      // Separamos por comas (puedes cambiar a ';' si tu Excel usa punto y coma)
      const columnas = linea.split(',').map(c => c.trim());

      const u: UsuarioImportar = {
        nombre: columnas[0] || '',
        apellidos: columnas[1] || '',
        email: columnas[2] || '',
        rol: (columnas[3] as 'Alumno' | 'Profesor') || 'Alumno',
        seleccionado: false, // Se marcará en validarFila si está todo ok
        errores: [],
        emailError: false
      };

      this.validarFila(u);

      // Si la fila nace sin errores, la seleccionamos por defecto para ahorrar clics
      if (u.errores.length === 0) {
        u.seleccionado = true;
      }

      return u;
    });
  }

  validarFila(u: UsuarioImportar): void {
    u.errores = [];
    u.emailError = false;

    // Validar con la lógica pura de tu clase Validator
    if (!Validator.hasMinLength(u.nombre, 2)) {
      u.errores.push('Nombre requerido');
    }

    if (!Validator.hasMinLength(u.apellidos, 2)) {
      u.errores.push('Apellidos requeridos');
    }

    if (!Validator.isEmail(u.email)) {
      u.errores.push('Email inválido');
      u.emailError = true;
    }

    // Bloqueo de checkbox si hay algún error
    if (u.errores.length > 0) {
      u.seleccionado = false;
    }
  }

  /**
   * Cálculos para los botones inferiores
   */
  totalSeleccionados(): number {
    return this.usuariosPrevia.filter(u => u.seleccionado).length;
  }

  haySeleccionados(): boolean {
    return this.totalSeleccionados() > 0;
  }

  /**
   * Envía los datos finales al componente padre
   */
  confirmarCarga(): void {
    const seleccionados = this.usuariosPrevia.filter(u => u.seleccionado);

    this.procesando = true;

    // Simulamos la subida al servidor
    setTimeout(() => {
      this.procesando = false;
      this.guardado.emit(seleccionados);
      this.cerrar.emit();
    }, 1500);
  }

  /**
   * Reset para volver a empezar
   */
  volver(): void {
    this.fase = 'subida';
    this.archivoNombre = '';
    this.archivoFile = null;
    this.usuariosPrevia = [];
  }
}