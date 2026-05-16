import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntregaService } from '../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../services/ArchivoEntrega.Service';
import { TokenService } from '../../../services/Token.Service';
import { lastValueFrom } from 'rxjs';
import { FormLabel } from '../../dialogs/form-label/form-label';

/**
 * GESTOR DE ENTREGAS: Formulario para la subida de tareas, gestión de archivos y textos del alumno.
 */
@Component({
  selector: 'app-form-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormLabel],
  templateUrl: './form-entrega.html',
  styleUrl: './form-entrega.scss'
})
export class FormEntrega implements OnInit {

  // --- Propiedades de Entrada y Salida ---
  @Input() recurso: any;                         // Contexto de la tarea actual
  @Input() entregaExistente: any = null;          // Datos para la carga en modo edición
  @Input() archivosExistentes: any[] = [];        // Listado de ficheros ya persistidos
  @Output() guardado = new EventEmitter<void>();  // Notificador de éxito en la operación
  @Output() cerrar = new EventEmitter<void>();    // Notificador de cierre de modal

  // --- Propiedades de Datos y UI ---
  entregaForm!: FormGroup;                        // Grupo de control reactivo
  nuevosArchivos: File[] = [];                    // Buffer temporal de ficheros a subir
  paraEliminar: number[] = [];                    // Registro de IDs marcados para borrado
  cargando: boolean = false;                      // Flag de control para el estado de envío

  // --- Propiedades de Validación de Formatos ---
  extensionesError: boolean = false;              // Indica si hay archivos con formato inválido
  mensajeError: string = '';                      // Mensaje descriptivo del error de formato

  /**
   * @param fb Constructor de formularios reactivos.
   * @param entregaService Operaciones de persistencia para la entidad Entrega.
   * @param archivoEntregaService Gestión del almacenamiento de ficheros asociados.
   * @param tokenService Proveedor de identidad del alumno autenticado.
   */
  constructor(
    private fb: FormBuilder,
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    private tokenService: TokenService
  ) {
    this.initForm();
  }

  /**
   * Inicializa la estructura del formulario reactivo con sus validaciones.
   */
  private initForm(): void {
    this.entregaForm = this.fb.group({
      textoEntrega: ['']
    });
  }

  /**
   * Ciclo de vida: Inicia la carga del texto de entrega si existe una versión previa.
   */
  ngOnInit(): void {
    if (this.entregaExistente) {
      this.entregaForm.patchValue({
        textoEntrega: this.entregaExistente.textoEntrega || ''
      });
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE ARCHIVOS ---
  // ===========================================================================

  /**
   * Sincroniza la selección del input file con la lista temporal de subida.
   * Realiza una validación inmediata de las extensiones y firmas reales.
   */
  async onFileChange(event: any): Promise<void> {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.nuevosArchivos.push(...files);
      event.target.value = '';
      await this.validarExtensiones();
    }
  }

  /**
   * Elimina un fichero del listado de nuevas cargas antes de procesar el envío.
   * Revalida las extensiones tras la eliminación.
   */
  async quitarNuevo(index: number): Promise<void> {
    this.nuevosArchivos.splice(index, 1);
    await this.validarExtensiones();
  }

  /**
   * Registra un archivo persistido para su eliminación definitiva tras confirmar el envío.
   */
  marcarEliminar(id: number): void {
    this.paraEliminar.push(id);
    this.archivosExistentes = this.archivosExistentes.filter(a => a.id !== id);
  }

  /**
   * Valida si los archivos en el buffer 'nuevosArchivos' cumplen con las
   * restricciones de formato y no son ejecutables disfrazados.
   * @private
   */
  private async validarExtensiones(): Promise<void> {
    if (this.nuevosArchivos.length === 0) {
      this.extensionesError = false;
      this.mensajeError = '';
      return;
    }

    if (this.recurso?.extensionesPermitidas) {
      const permitidas = this.recurso.extensionesPermitidas
        .toLowerCase()
        .split(',')
        .map((ext: string) => ext.trim());

      const tieneNombreInvalido = this.nuevosArchivos.some(file => {
        const nombre = file.name.toLowerCase();
        return !permitidas.some((ext: string) => nombre.endsWith(ext));
      });

      if (tieneNombreInvalido) {
        this.setExceptionArchivo(`Formato no permitido por nombre. Use: ${this.recurso.extensionesPermitidas}`);
        return;
      }
    }

    // 2. Validación profunda: Evitar ejecutables disfrazados (Magic Numbers)
    for (const file of this.nuevosArchivos) {
      const esEjecutable = await this.verificarSiEsEjecutable(file);
      if (esEjecutable) {
        this.setExceptionArchivo(`Seguridad: El archivo "${file.name}" es un ejecutable no permitido.`);
        return;
      }
    }

    // Si todo es correcto, limpiamos errores
    this.extensionesError = false;
    this.mensajeError = '';
  }

  /**
   * Lee los primeros bytes del archivo para detectar firmas MZ (Windows Executable).
   * @param file Archivo a inspeccionar.
   * @private
   */
  private async verificarSiEsEjecutable(file: File): Promise<boolean> {
    try {
      const blob = file.slice(0, 2);
      const buffer = await blob.arrayBuffer();
      const uint = new Uint8Array(buffer);
      // Firma 'MZ' en hexadecimal es 4d 5a
      const magic = uint[0].toString(16) + uint[1].toString(16);
      return magic.toLowerCase() === '4d5a';
    } catch (e) {
      return false;
    }
  }

  /**
   * Centraliza el marcado de error en la UI de archivos.
   * @param msg Mensaje de error.
   * @private
   */
  private setExceptionArchivo(msg: string): void {
    this.extensionesError = true;
    this.mensajeError = msg;
  }

  // ===========================================================================
  // --- PROCESAMIENTO Y ENVÍO ---
  // ===========================================================================

  /**
   * Coordina el flujo de persistencia: actualización de texto, borrado de archivos y subida de nuevos.
   */
  async enviar(): Promise<void> {
    if (this.entregaForm.invalid || this.extensionesError) return;

    const idUsuario = this.tokenService.getId();
    const idTarea = this.recurso?.idTarea || this.recurso?.id;

    if (!idUsuario || !idTarea) {
      console.error("ERROR: No se puede enviar; falta identificación de Usuario o Tarea");
      return;
    }

    this.cargando = true;
    const datosEntrega = this.entregaForm.value;

    try {
      let idEntrega: number;

      if (this.entregaExistente) {
        idEntrega = this.entregaExistente.idEntrega;
        await lastValueFrom(this.entregaService.actualizar(idEntrega, datosEntrega));

        for (const idF of this.paraEliminar) {
          await lastValueFrom(this.archivoEntregaService.eliminar(idF));
        }
      } else {
        const resp = await lastValueFrom(this.entregaService.enviar({
          idTarea: idTarea,
          idUsuario: idUsuario,
          textoEntrega: datosEntrega.textoEntrega
        }));
        idEntrega = resp.data.idEntrega;
      }

      for (const file of this.nuevosArchivos) {
        await lastValueFrom(this.archivoEntregaService.guardar(idEntrega, file));
      }

      this.guardado.emit();
      this.cerrar.emit();

    } catch (e: any) {
      console.error("CRITICAL: Fallo en el proceso de entrega", e);
      this.extensionesError = true;
      this.mensajeError = e.error?.message || 'Ocurrió un error al procesar la entrega.';
    } finally {
      this.cargando = false;
    }
  }
}