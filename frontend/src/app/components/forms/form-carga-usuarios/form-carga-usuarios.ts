import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validator } from '../../../validators/Validator';
import { UsuarioService } from '../../../services/Usuario.Service';
import { NotificacionService } from '../../../services/Notificacion.Service';
import { FormLabel } from '../../dialogs/form-label/form-label';

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
 * IMPORTADOR MASIVO: Gestión de carga de usuarios mediante archivos CSV y validación previa.
 */
@Component({
  selector: 'app-form-carga-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, FormLabel],
  templateUrl: './form-carga-usuarios.html',
  styleUrl: './form-carga-usuarios.scss'
})
export class FormCargaUsuarios {

  // --- Propiedades de Salida ---
  @Output() cerrar = new EventEmitter<void>();        // Notificador de cierre de modal
  @Output() guardado = new EventEmitter<any[]>();     // Emisión de registros creados con éxito

  // --- Propiedades de Datos y Archivo ---
  archivoNombre: string = '';                         // Etiqueta visual del fichero seleccionado
  archivoFile: File | null = null;                    // Referencia física del archivo en memoria
  usuariosPrevia: UsuarioImportar[] = [];             // Colección de registros extraídos para revisión

  // --- Propiedades de Estado y UI ---
  fase: 'subida' | 'previa' = 'subida';               // Control del flujo del asistente
  procesando: boolean = false;                        // Bloqueo de UI durante tareas asíncronas

  /**
   * @param cdr Trigger manual para asegurar la paridad vista-modelo tras procesos de lectura.
   * @param usuarioService Servicio de dominio para la persistencia masiva.
   * @param notificacion Gestor de diálogos y alertas del sistema.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private notificacion: NotificacionService
  ) { }

  // ===========================================================================
  // --- CARGA Y PROCESAMIENTO ---
  // ===========================================================================

  /**
   * Captura el archivo del input y lo prepara para el procesamiento.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoNombre = file.name;
      this.archivoFile = file;
    }
  }

  /**
   * Inicia la lectura del contenido del archivo y activa la vista de revisión.
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
      this.notificacion.mostrar({ titulo: 'Error', mensaje: 'No se pudo leer el archivo.', tipo: 'error' });
      this.procesando = false;
      this.cdr.detectChanges();
    };
    reader.readAsText(this.archivoFile);
  }

  /**
   * Transforma el texto plano en objetos tipados y ejecuta la validación de cada fila.
   * Incluye detección de duplicados dentro del propio archivo CSV.
   */
  private parsearCSV(texto: string): void {
    const lineas = texto.split(/\r?\n/);
    const filasDato = lineas.slice(1).filter(l => l.trim() !== '');

    // Sets auxiliares para detectar duplicidad interna en el archivo
    const dnisVistos = new Set<string>();
    const emailsVistos = new Set<string>();

    this.usuariosPrevia = filasDato.map(linea => {
      const col = linea.split(',').map(c => c.trim());
      const u: UsuarioImportar = {
        dni: col[0] || '',
        nombre: col[1] || '',
        apellidos: col[2] || '',
        email: col[3] || '',
        rol: (col[4] as 'Alumno' | 'Profesor') || 'Alumno',
        seleccionado: false,
        errores: [],
        dniError: false,
        emailError: false
      };

      this.validarFila(u);

      // --- Validación de duplicados internos ---
      const dniKey = u.dni.toUpperCase();
      const emailKey = u.email.toLowerCase();

      if (dnisVistos.has(dniKey)) {
        u.errores.push('DNI duplicado en el CSV');
        u.dniError = true;
      }
      if (emailsVistos.has(emailKey)) {
        u.errores.push('Email duplicado en el CSV');
        u.emailError = true;
      }

      dnisVistos.add(dniKey);
      emailsVistos.add(emailKey);
      // -----------------------------------------

      if (u.errores.length === 0) u.seleccionado = true;
      return u;
    });
  }

  /**
   * Comprueba la integridad de los datos según las reglas de negocio.
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

  // ===========================================================================
  // --- ACCIONES Y ENVÍO ---
  // ===========================================================================

  /**
   * Coordina el envío de los usuarios seleccionados hacia el servidor.
   * Captura errores de restricción de base de datos (Duplicate entry).
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
    }));

    this.usuarioService.crearVariosUsuarios(data).subscribe({
      next: (res) => {
        this.notificacion.mostrar({ titulo: 'Éxito', mensaje: 'Importación completada.', tipo: 'exito' });
        this.guardado.emit(res.data);
        this.cerrar.emit();
      },
      error: (err) => {
        this.procesando = false;
        let errorBackend = err.error?.message || '';

        const esDuplicado = errorBackend.toLowerCase().includes('duplicate') ||
          errorBackend.toLowerCase().includes('ya existe') ||
          errorBackend.toLowerCase().includes('ya está registrado');

        if (esDuplicado) {
          const matchesComillas = errorBackend.match(/'([^']+)'/);
          const valorConflictivo = matchesComillas ? matchesComillas[1] : '';

          if (valorConflictivo) {
            this.usuariosPrevia.forEach(u => {
              if (u.dni === valorConflictivo || u.email === valorConflictivo) {
                u.errores = [`${u.dni === valorConflictivo ? 'DNI' : 'Email'} ya registrado en el sistema`];
                if (u.dni === valorConflictivo) u.dniError = true;
                if (u.email === valorConflictivo) u.emailError = true;
                u.seleccionado = false; 
              }
            });
            this.notificacion.mostrar({
              titulo: 'Dato duplicado',
              mensaje: `El registro con "${valorConflictivo}" ya existe en la base de datos.`,
              tipo: 'error'
            });
          } else {
            this.notificacion.mostrar({ titulo: 'Error', mensaje: errorBackend, tipo: 'error' });
          }
        } else {
          this.notificacion.mostrar({ titulo: 'Fallo de importación', mensaje: 'No se pudo completar la carga masiva.', tipo: 'error' });
        }

        this.cdr.detectChanges();
      }
    });
  }

  /**
   * @returns Total de registros marcados para procesar.
   */
  totalSeleccionados(): number {
    return this.usuariosPrevia.filter(u => u.seleccionado).length;
  }

  /**
   * @returns True si existe al menos un usuario seleccionado para importar.
   */
  haySeleccionados(): boolean {
    return this.totalSeleccionados() > 0;
  }

  /**
 * Alterna la selección de todos los usuarios que no tengan errores.
 * @param event Evento del checkbox maestro.
 */
  toggleTodos(event: any): void {
    const check = event.target.checked;
    this.usuariosPrevia.forEach(u => {
      if (u.errores.length === 0) {
        u.seleccionado = check;
      }
    });
  }

  /**
   * Indica si todos los registros válidos están seleccionados.
   * @returns boolean
   */
  todosSeleccionados(): boolean {
    const validos = this.usuariosPrevia.filter(u => u.errores.length === 0);
    return validos.length > 0 && validos.every(u => u.seleccionado);
  }

  /**
   * Estado indeterminado para el checkbox maestro (si hay algunos seleccionados pero no todos).
   * @returns boolean
   */
  algunosSeleccionados(): boolean {
    const seleccionados = this.totalSeleccionados();
    const validos = this.usuariosPrevia.filter(u => u.errores.length === 0).length;
    return seleccionados > 0 && seleccionados < validos;
  }

  /**
   * Reinicia el estado del componente para una nueva carga.
   */
  volver(): void {
    this.fase = 'subida';
    this.archivoNombre = '';
    this.archivoFile = null;
    this.usuariosPrevia = [];
    this.cdr.detectChanges();
  }
}