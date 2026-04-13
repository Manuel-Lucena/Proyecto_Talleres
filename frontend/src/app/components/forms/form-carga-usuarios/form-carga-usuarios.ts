import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';
import { UsuarioService } from '../../../services/Usuario.Service';
import { NotificacionService } from '../../../services/Notificacion.Service';

interface UsuarioImportar {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: 'Alumno' | 'Profesor';
  seleccionado: boolean;
  errores: string[];
  dniError: boolean;
  emailError: boolean;
}

/**
 * Componente para la importación masiva de usuarios mediante archivos CSV.
 */
@Component({
  selector: 'app-form-carga-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-carga-usuarios.html',
  styleUrl: './form-carga-usuarios.scss'
})
export class FormCargaUsuarios {
  @Output() cerrar = new EventEmitter<void>(); // Notifica el cierre del modal
  @Output() guardado = new EventEmitter<any[]>(); // Emite los usuarios creados con éxito

  archivoNombre: string = ''; // Nombre visible del archivo
  archivoFile: File | null = null; // Referencia al archivo en memoria
  fase: 'subida' | 'previa' = 'subida'; // Controla el paso actual del flujo
  procesando: boolean = false; // Flag para bloquear la UI durante procesos
  usuariosPrevia: UsuarioImportar[] = []; // Lista de usuarios extraídos del CSV

  /**
   * @param cdr Servicio para forzar la detección de cambios en procesos asíncronos.
   * @param usuarioService Servicio para la persistencia de datos de usuarios.
   * @param notificacion Servicio para la gestión de modales y alertas globales.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private notificacion: NotificacionService
  ) { }

  /**
   * Captura el archivo seleccionado del input.
   * @param event Evento nativo del input file.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoNombre = file.name;
      this.archivoFile = file;
    }
  }

  /**
   * Inicia la lectura del CSV y activa la fase de previsualización.
   */
  procesarArchivo(): void {
    if (!this.archivoFile) return;
    this.procesando = true;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.parsearCSV(e.target.result);
      this.fase = 'previa';
      this.procesando = false;
      this.cdr.detectChanges();
    };

    reader.onerror = () => {
      this.notificacion.mostrar({
        titulo: 'Error',
        mensaje: 'No se pudo leer el archivo CSV.',
        tipo: 'error'
      });
      this.procesando = false;
      this.cdr.detectChanges();
    };

    reader.readAsText(this.archivoFile);
  }

  /**
   * Transforma el contenido del CSV en una lista de objetos validados.
   * @param texto Contenido bruto del archivo.
   */
  private parsearCSV(texto: string): void {
    const lineas = texto.split(/\r?\n/);
    const filasDato = lineas.slice(1).filter(l => l.trim() !== '');

    this.usuariosPrevia = filasDato.map(linea => {
      const columnas = linea.split(',').map(c => c.trim());
      const u: UsuarioImportar = {
        dni: columnas[0] || '',
        nombre: columnas[1] || '',
        apellidos: columnas[2] || '',
        email: columnas[3] || '',
        rol: (columnas[4] as 'Alumno' | 'Profesor') || 'Alumno',
        seleccionado: false,
        errores: [],
        dniError: false,
        emailError: false
      };

      this.validarFila(u);
      if (u.errores.length === 0) u.seleccionado = true;
      return u;
    });
  }

  /**
   * Valida la integridad de una fila y marca los errores específicos.
   * @param u Objeto del usuario a validar.
   */
  validarFila(u: UsuarioImportar): void {
    u.errores = [];
    u.dniError = !Validator.isDni(u.dni);
    u.emailError = !Validator.isEmail(u.email);

    if (u.dniError) u.errores.push('DNI/NIE inválido');
    if (!Validator.hasMinLength(u.nombre, 2)) u.errores.push('Nombre corto');
    if (u.emailError) u.errores.push('Email inválido');

    if (u.errores.length > 0) u.seleccionado = false;
  }

  /**
   * @returns El total de registros marcados para importar.
   */
  totalSeleccionados(): number {
    return this.usuariosPrevia.filter(u => u.seleccionado).length;
  }

  /**
   * @returns true si hay usuarios listos para ser guardados.
   */
  haySeleccionados(): boolean {
    return this.totalSeleccionados() > 0;
  }

  /**
   * Solicita confirmación y ejecuta la carga masiva hacia el servidor.
   */
  async confirmarCarga(): Promise<void> {
    const seleccionados = this.usuariosPrevia.filter(u => u.seleccionado);

    const ok = await this.notificacion.confirmar({
      titulo: 'Confirmar carga',
      mensaje: `¿Deseas importar ${seleccionados.length} usuarios?`
    });

    if (!ok) return;

    this.procesando = true;

    const data = seleccionados.map(u => ({
      dni: u.dni,
      nombre: u.nombre,
      apellidos: u.apellidos,
      email: u.email,
      idRol: u.rol === 'Profesor' ? 2 : 3,
      password: u.dni
    }));

    this.usuarioService.crearVariosUsuarios(data).subscribe({
      next: (res) => {
        this.notificacion.mostrar({
          titulo: 'Éxito',
          mensaje: 'Usuarios importados correctamente.',
          tipo: 'exito'
        });
        this.guardado.emit(res.data);
        this.cerrar.emit();
      },
      error: () => {
        this.procesando = false;
        this.notificacion.mostrar({
          titulo: 'Error',
          mensaje: 'Fallo en la importación. Revisa duplicados.',
          tipo: 'error'
        });
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Reinicia el componente para permitir una nueva selección de archivo.
   */
  volver(): void {
    this.fase = 'subida';
    this.archivoNombre = '';
    this.archivoFile = null;
    this.usuariosPrevia = [];
    this.cdr.detectChanges();
  }
}