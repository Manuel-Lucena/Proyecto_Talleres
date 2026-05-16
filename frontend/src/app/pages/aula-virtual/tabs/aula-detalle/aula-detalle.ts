import { ChangeDetectorRef, Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// --- Capa de Servicios e Interfaces ---
import { TareaService } from '../../../../services/Tarea.Service';
import { MaterialService } from '../../../../services/Material.Service';
import { ArchivoTareaService } from '../../../../services/ArchivoTarea.Service';
import { ArchivoMaterialService } from '../../../../services/ArchivoMaterial.Service';
import { ArchivoService } from '../../../../services/Archivo.Service';
import { EntregaService } from '../../../../services/Entrega.Service';
import { ArchivoEntregaService } from '../../../../services/ArchivoEntrega.Service';
import { TokenService } from '../../../../services/Token.Service';
import { NotificacionService } from '../../../../services/Notificacion.Service';
import { UsuarioService } from '../../../../services/Usuario.Service';
import { TareaAsignadaService } from '../../../../services/TareaAsignada.Service';
import { BreadcrumbService } from '../../../../services/Breadcrumb.Service';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';

// --- Componentes UI / Dialogs ---
import { FormEntrega } from '../../../../components/forms/form-entrega/form-entrega';
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";

/**
 * NÚCLEO OPERATIVO: Gestión Detallada de Recursos Educativos.
 * * Este componente actúa como el controlador maestro para la visualización y edición 
 * de tareas y materiales didácticos. Gestiona:
 * 1. La dualidad de tipos de datos (Polimorfismo en UI).
 * 2. La persistencia compleja (archivos + datos de base).
 * 3. La lógica de negocio segmentada por roles (Profesor/Alumno).
 */
@Component({
  selector: 'app-aula-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormEntrega,
    Notificacion,
    Confirmacion
  ],
  templateUrl: './aula-detalle.html',
  styleUrl: './aula-detalle.scss',
})
export class AulaDetalle implements OnInit {

  // --- Propiedades de Datos y Contexto ---
  /** Objeto que contiene la información del recurso (Tarea o Material) */
  recurso: any = null;
  /** 'tarea' o 'material' - Determina el comportamiento del componente */
  tipo: string = '';
  /** ID del taller de procedencia */
  idTaller: number = 0;
  /** Grupo de controles para el formulario reactivo */
  form: FormGroup;

  // --- Propiedades de Estado y UI ---
  /** Controla el spinner de carga inicial */
  cargando: boolean = true;
  /** Indica si se está creando un recurso desde cero */
  esNuevo: boolean = false;
  /** Switch de modo lectura / modo edición */
  editando: boolean = false;
  /** Visibilidad del modal de entregas para alumnos */
  mostrarModalEntrega: boolean = false;
  /** Visibilidad del panel de selección de extensiones */
  mostrarDropdownExt: boolean = false;
  /** Visibilidad del panel de asignación de alumnos */
  mostrarDropdownAlumnos: boolean = false;

  // --- Dominio de Alumnos y Asignaciones ---
  /** Lista total de alumnos inscritos en el taller */
  alumnosTaller: UsuarioResponse[] = [];
  /** IDs de los alumnos que tienen la tarea asignada actualmente */
  alumnosSeleccionadosIds: number[] = [];
  /** Cadena de búsqueda para filtrar alumnos en el dropdown */
  filtroAlumno: string = '';

  // --- Dominio de Gestión de Archivos ---
  /** Documentos adjuntos originales del recurso */
  archivosAdjuntos: any[] = [];
  /** IDs de archivos marcados para su borrado físico en servidor */
  archivosParaEliminar: number[] = [];
  /** Buffer de nuevos archivos seleccionados en el input local */
  nuevosArchivos: File[] = [];
  /** Datos de la entrega realizada (solo si el usuario es alumno) */
  entregaRealizada: any = null;
  /** Archivos que el alumno adjuntó en su propia entrega */
  archivosEntregaExistentes: any[] = [];

  /** Diccionario estático de extensiones para la configuración de tareas */
  extensionesDisponibles = [
    { label: 'Documentos PDF (.pdf)', value: '.pdf' },
    { label: 'Microsoft Word (.doc, .docx)', value: '.doc, .docx' },
    { label: 'Hojas de Excel (.xlsx)', value: '.xlsx' },
    { label: 'Archivos ZIP/RAR (.zip, .rar)', value: '.zip, .rar' },
    { label: 'Imágenes (.jpg, .png)', value: '.jpg, .png' }
  ];

  /**
   * @param route Acceso a la ruta activa para capturar IDs.
   * @param router Servicio de navegación.
   * @param fb Factoría para formularios.
   * @param cdr Detección de cambios manual para subidas/descargas.
   * @param eRef Referencia al DOM para cierres de menús automáticos.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tareaService: TareaService,
    private materialService: MaterialService,
    private archivoTareaService: ArchivoTareaService,
    private archivoMaterialService: ArchivoMaterialService,
    private archivoService: ArchivoService,
    private entregaService: EntregaService,
    private archivoEntregaService: ArchivoEntregaService,
    public tokenService: TokenService,
    private breadcrumbService: BreadcrumbService,
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService,
    private tareaAsignadaService: TareaAsignadaService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      // Añadimos el validador personalizado aquí:
      fechaEntrega: ['', [this.validarAnioCoherente]],
      extensionesPermitidas: ['.pdf, .doc, .docx']
    });
  }

  /**
   * Listener global para el cierre de dropdowns al clickear fuera del área del componente.
   * @param event Objeto del evento de click.
   */
  @HostListener('document:click', ['$event'])
  clickOut(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.mostrarDropdownExt = false;
      this.mostrarDropdownAlumnos = false;
    }
  }

  /**
   * Inicialización: Resuelve contexto, roles y recarga de datos.
   */
  ngOnInit(): void {
    this.idTaller = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.tipo = this.route.snapshot.paramMap.get('tipo') || '';
    const idRecursoRaw = this.route.snapshot.paramMap.get('idRecurso');

    if (this.esProfesor()) {
      this.cargarAlumnosDelTaller();
    }

    if (!idRecursoRaw || idRecursoRaw === 'nuevo') {
      this.esNuevo = true;
      this.editando = true;
      this.cargando = false;
      this.recurso = { titulo: '', visible: true };
      this.form.updateValueAndValidity();
    } else {
      this.cargarDatos(Number(idRecursoRaw));
    }
  }

  // ===========================================================================
  // --- GESTIÓN DE LA CARGA DE DATOS ---
  // ===========================================================================

  /**
   * Recupera la lista de alumnos inscritos en el taller actual desde el servidor.
   * @private
   */
  private cargarAlumnosDelTaller(): void {
    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.alumnosTaller = resp.data.filter(u => u.nombreRol === 'ALUMNO');

        // Si estamos creando una tarea, la marcamos para todos los alumnos actuales por defecto
        if (this.esNuevo && this.tipo === 'tarea') {
          this.alumnosSeleccionadosIds = this.alumnosTaller.map(a => a.idUsuario);
        }
      }
    });
  }
  /**
   * Método orquestador para cargar toda la información del recurso actual.
   * @param id Identificador único del recurso (Tarea o Material).
   */
  cargarDatos(id: number): void {
    this.cargando = true;
    const service: any = this.tipo === 'tarea' ? this.tareaService : this.materialService;

    service.obtenerPorId(id).subscribe({
      next: (resp: any) => {
        this.recurso = resp.data;
        this.breadcrumbService.setRecursoNombre(this.recurso.titulo);
        this.obtenerArchivos(id);

        if (this.tipo === 'tarea') {
          if (!this.esProfesor()) {
            this.verificarEntregaExistente(id);
          } else {
            this.cargarAsignaciones(id);
          }
        }
      },
      error: () => this.redirigirPorError()
    });
  }

  /**
   * Recupera la lista de IDs de alumnos que tienen esta tarea asignada.
   * @param idTarea ID de la tarea a consultar.
   * @private
   */
  private cargarAsignaciones(idTarea: number): void {
    this.tareaAsignadaService.listarPorTarea(idTarea).subscribe({
      next: (resp) => {
        this.alumnosSeleccionadosIds = resp.data.map((a: any) => a.idAlumno);
      }
    });
  }

  /**
   * Lógica para Alumnos: Verifica si existe un envío para esta tarea.
   * @param idTarea ID de la tarea.
   * @private
   */
  /**
 * Lógica para Alumnos: Verifica si el usuario actual ya ha realizado un envío.
 * @param idTarea ID de la tarea.
 * @private
 */
  private verificarEntregaExistente(idTarea: number): void {
    const idUsuario = this.tokenService.getId();
    if (!idUsuario) return;

    this.entregaService.obtenerMiEntrega(idTarea).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.entregaRealizada = resp.data;
          this.recurso.entregado = true;
          this.recurso.calificacion = resp.data.calificacion;

          this.archivoEntregaService.listarPorEntrega(resp.data.idEntrega).subscribe({
            next: (archResp) => {
              this.archivosEntregaExistentes = archResp.data || [];
              this.cdr.detectChanges();
            }
          });
        } else {
          this.entregaRealizada = null;
          this.recurso.entregado = false;
          this.archivosEntregaExistentes = [];
        }
      },
      error: (err) => {
        this.entregaRealizada = null;
        this.recurso.entregado = false;
      }
    });
  }

  /**
   * Obtiene la colección de archivos adjuntos del recurso actual.
   * @param id ID del recurso.
   * @private
   */
  private obtenerArchivos(id: number): void {
    const service: any = this.tipo === 'tarea' ? this.archivoTareaService : this.archivoMaterialService;
    const metodo = this.tipo === 'tarea' ? 'listarPorTarea' : 'listarPorMaterial';

    service[metodo](id).subscribe({
      next: (resp: any) => {
        this.archivosAdjuntos = resp.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.archivosAdjuntos = [];
        this.cargando = false;
      }
    });
  }

  // ===========================================================================
  // --- GESTIÓN DE ASIGNACIONES (PROFESOR) ---
  // ===========================================================================

  /**
   * Abre o cierra el desplegable de asignación de alumnos.
   */
  toggleDropdownAlumnos(): void {
    this.mostrarDropdownAlumnos = !this.mostrarDropdownAlumnos;
  }

  /**
 * Gestiona la selección masiva de alumnos.
 * Si están todos marcados, limpia la lista. Si no, los marca a todos.
 */
  toggleTodosAlumnos(): void {
    if (this.alumnosSeleccionadosIds.length === this.alumnosTaller.length) {
      this.alumnosSeleccionadosIds = [];
    } else {
      this.alumnosSeleccionadosIds = this.alumnosTaller.map(a => a.idUsuario);
    }
  }

  /**
   * Añade o quita un alumno del buffer de asignación.
   * @param idAlumno ID del alumno a conmutar.
   */
  onAlumnoToggle(idAlumno: number): void {
    const index = this.alumnosSeleccionadosIds.indexOf(idAlumno);
    if (index > -1) {
      this.alumnosSeleccionadosIds.splice(index, 1);
    } else {
      this.alumnosSeleccionadosIds.push(idAlumno);
    }
  }

  /**
   * Filtra la lista de alumnos basándose en el input de búsqueda.
   * @returns Lista de alumnos filtrada.
   */
  get alumnosFiltrados(): UsuarioResponse[] {
    if (!this.filtroAlumno) return this.alumnosTaller;
    const busqueda = this.filtroAlumno.toLowerCase();
    return this.alumnosTaller.filter(a =>
      (a.nombre + ' ' + a.apellidos).toLowerCase().includes(busqueda)
    );
  }

  // ===========================================================================
  // --- LÓGICA DE FORMULARIOS Y COMMITS ---
  // ===========================================================================

  /**
   * Abre o cierra el desplegable de extensiones permitidas.
   */
  toggleDropdownExt(): void {
    this.mostrarDropdownExt = !this.mostrarDropdownExt;
  }

  /**
   * Gestiona la selección múltiple de extensiones y actualiza el campo del formulario.
   * @param event Evento de cambio del checkbox.
   */
  onExtensionChange(event: any): void {
    const value: string = event.target.value;
    const valorActual: string = this.form.get('extensionesPermitidas')?.value || '';

    let seleccionadas: string[] = valorActual
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const extensionesNuevas: string[] = value.split(',').map((s: string) => s.trim());

    if (event.target.checked) {
      seleccionadas = [...new Set([...seleccionadas, ...extensionesNuevas])];
    } else {
      seleccionadas = seleccionadas.filter((ext: string) => !extensionesNuevas.includes(ext));
    }

    const resultadoFinal: string = seleccionadas.join(', ');

    this.form.patchValue({ extensionesPermitidas: resultadoFinal });
    this.cdr.detectChanges();
  }

  /**
   * Verifica si una extensión está en la lista de seleccionadas para marcar el check.
   * @param value Extensión a verificar.
   * @returns Booleano resultante.
   */
  estaMarcada(value: string): boolean {
    const current = this.form.get('extensionesPermitidas')?.value || '';
    return current.includes(value);
  }

  /**
   * Determina si el usuario logueado tiene rol administrativo o docente.
   * @returns True si es Profesor/Admin.
   */
  esProfesor(): boolean {
    const rol = this.tokenService.getRol();
    return rol === 'PROFESOR' || rol === 'ADMIN';
  }

  /**
   * Activa el modo edición y precarga el formulario con los datos actuales del recurso.
   */
  activarEdicion(): void {
    this.editando = true;
    this.form.patchValue({
      titulo: this.recurso.titulo,
      descripcion: this.tipo === 'tarea' ? this.recurso.descripcion : this.recurso.contenido,
      fechaEntrega: this.recurso.fechaEntrega ? this.recurso.fechaEntrega.substring(0, 16) : '',
      extensionesPermitidas: this.recurso.extensionesPermitidas || '.pdf, .doc, .docx'
    });
  }

  /**
   * Captura los archivos seleccionados por el usuario y los guarda en el buffer local.
   * @param event Evento del input file.
   */
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  /**
   * Elimina un archivo del buffer temporal de subida.
   * @param index Posición en el array.
   */
  quitarNuevoArchivo(index: number): void {
    this.nuevosArchivos.splice(index, 1);
  }

  /**
   * Registra un archivo existente para su eliminación física al confirmar cambios.
   * @param id ID del archivo.
   */
  marcarParaEliminar(id: number): void {
    this.archivosParaEliminar.push(id);
    this.archivosAdjuntos = this.archivosAdjuntos.filter(a => a.id !== id);
  }

  /**
   * PROCEDIMIENTO CRÍTICO: Guarda los cambios del recurso, gestiona asignaciones 
   * y procesa la cola de archivos (borrado y subida).
   */
  async guardarTodo(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;

    const v = this.form.value;
    const payload: any = {
      titulo: v.titulo,
      idTaller: this.idTaller,
      visible: this.recurso.visible ?? true
    };

    if (this.tipo === 'material') {
      payload.contenido = v.descripcion;
    } else {
      payload.descripcion = v.descripcion;
      payload.fechaEntrega = v.fechaEntrega === '' ? null : v.fechaEntrega;
      payload.extensionesPermitidas = v.extensionesPermitidas;
    }

    const service: any = this.tipo === 'tarea' ? this.tareaService : this.materialService;
    const archService: any = this.tipo === 'tarea' ? this.archivoTareaService : this.archivoMaterialService;
    const idRec = this.esNuevo ? null : (this.recurso.idTarea || this.recurso.id);

    (this.esNuevo ? service.crear(payload) : service.actualizar(idRec, payload)).subscribe({
      next: async (resp: any) => {
        const idActual = this.esNuevo ? (resp.data.idTarea || resp.data.id) : idRec;

        if (this.tipo === 'tarea') {
          await lastValueFrom(this.tareaAsignadaService.actualizarAsignaciones(idActual, this.alumnosSeleccionadosIds));
        }

        for (const fId of this.archivosParaEliminar) {
          await lastValueFrom(archService.eliminar(fId));
        }

        for (const file of this.nuevosArchivos) {
          await lastValueFrom(archService.guardar(idActual, file));
        }

        this.finalizarGuardado(idActual);
      },
      error: () => {
        this.cargando = false;
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo guardar', tipo: 'error' });
      }
    });
  }

  /**
   * Dispara un diálogo de confirmación y elimina el recurso si el usuario acepta.
   */
  eliminarRecurso(): void {
    const esTarea = this.tipo === 'tarea';
    const idRecurso = esTarea ? this.recurso.idTarea : this.recurso.id;

    this.notificacionService.confirmar({
      titulo: `¿Eliminar ${this.tipo}?`,
      mensaje: `Se borrará permanentemente "${this.recurso.titulo}".`,
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.cargando = true;
        const service: any = esTarea ? this.tareaService : this.materialService;
        service.eliminar(idRecurso).subscribe({
          next: () => {
            this.notificacionService.mostrar({ titulo: 'Eliminado', mensaje: `Correctamente`, tipo: 'exito' });
            this.volver();
          },
          error: () => {
            this.cargando = false;
            this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo eliminar', tipo: 'error' });
          }
        });
      }
    });
  }

  /**
   * Cambia la visibilidad pública del recurso de forma inmediata en el backend.
   */
  toggleVisibilidadRapida(): void {
    const id = this.recurso.idTarea || this.recurso.id;
    const service: any = this.tipo === 'tarea' ? this.tareaService : this.materialService;
    if (!id) return;

    service.cambiarVisibilidad(id).subscribe({
      next: (resp: any) => {
        this.recurso.visible = resp.data.visible;
        this.cdr.detectChanges();
      }
    });
  }

  // ===========================================================================
  // --- LÓGICA DE DESCARGAS (BLOBS) ---
  // ===========================================================================

  /**
   * Gestiona la petición del archivo al servidor y dispara la descarga del Blob.
   * @param archivo Objeto con los metadatos del archivo.
   */
  descargarAdjunto(archivo: any): void {
    if (this.editando) return;
    this.archivoService.obtenerBlob(this.tipo === 'tarea' ? 'tarea' : 'material', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  /**
   * Descarga un archivo perteneciente a la entrega de un alumno.
   * @param archivo Metadatos del archivo de entrega.
   */
  descargarArchivoAlumno(archivo: any): void {
    this.archivoService.obtenerBlob('entrega', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  /**
   * Técnica de descarga: Crea un enlace invisible en el DOM para forzar la bajada del archivo.
   * @param blob Contenido binario.
   * @param nombre Nombre del archivo resultante.
   * @private
   */
  private ejecutarDescarga(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ===========================================================================
  // --- NAVEGACIÓN Y UTILIDADES ---
  // ===========================================================================

  /**
   * Finaliza el flujo de guardado, limpia los buffers y actualiza la ruta si es necesario.
   * @param id ID del recurso guardado.
   * @private
   */
  private finalizarGuardado(id: number): void {
    this.editando = false;
    this.nuevosArchivos = [];
    this.archivosParaEliminar = [];

    if (this.esNuevo) {
      this.router.navigate(['/aula-virtual', this.idTaller, 'muro'], { replaceUrl: true });
    } else {
      this.cargarDatos(id);
    }
  }

  /**
   * Revierte los cambios no guardados o vuelve atrás si es una creación.
   */
  cancelar(): void {
    if (this.esNuevo) {
      this.volver();
    } else {
      this.editando = false;
      this.form.reset();
      this.cargarDatos(this.recurso.idTarea || this.recurso.id);
    }
  }

  /**
   * Muestra el modal para que el alumno pueda subir su trabajo.
   */
  abrirModalEntrega(): void {
    this.mostrarModalEntrega = true;
  }

  /**
   * Validador personalizado para evitar años astronómicos 
   */
  private validarAnioCoherente(control: any) {
    const fechaValue = control.value;
    if (fechaValue) {
      const fecha = new Date(fechaValue);
      const anio = fecha.getFullYear();
      if (anio < 2024 || anio > 2100) {
        return { fechaInvalida: true };
      }
    }
    return null;
  }

  /**
   * Callback ejecutado cuando el componente hijo de entrega confirma éxito.
   */
  onEntregaGuardada(): void {
    this.notificacionService.mostrar({ titulo: 'Hecho', mensaje: 'Entrega enviada', tipo: 'exito' });
    this.cargarDatos(this.recurso.idTarea || this.recurso.id);
  }

  /**
   * Navega a la vista de seguimiento (corrección de entregas) de la tarea.
   */
  irASeguimiento(): void {
    const idTarea = this.recurso.idTarea || this.recurso.id;
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas', idTarea, 'seguimiento']);
  }

  /**
   * Navega de vuelta al listado principal.
   */
  volver(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, this.tipo === 'tarea' ? 'tareas' : 'recursos']);
  }

  /**
   * Gestión de errores en la carga: Redirección de seguridad.
   * @private
   */
  private redirigirPorError(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'muro']);
  }

  /**
   * Formatea el tiempo remanente de una tarea para su visualización humana.
   * @param fechaFin Fecha en formato string.
   * @returns String formateado (ej: "2 días y 3 horas restantes").
   */
  calcularTiempo(fechaFin: string): string {
    if (!fechaFin) return 'Sin fecha límite';
    const diff = new Date(fechaFin).getTime() - new Date().getTime();
    if (diff < 0) return `Plazo finalizado`;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${dias} días y ${horas} horas restantes`;
  }
}