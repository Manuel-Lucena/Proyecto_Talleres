import { ChangeDetectorRef, Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

// Servicios e Interfaces
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
import { FormEntrega } from '../../../../components/forms/form-entrega/form-entrega';
import { UsuarioResponse } from '../../../../interfaces/Usuario.Interface';
import { BreadcrumbService } from '../../../../services/Breadcrumb.Service';
import { Notificacion } from "../../../../components/dialogs/mensaje/notificacion";
import { Confirmacion } from "../../../../components/dialogs/confirmacion/confirmacion";

/**
 * Componente para gestionar el detalle de recursos (Tareas o Materiales).
 * Permite la creación, edición, asignación de alumnos y gestión de archivos.
 */
@Component({
  selector: 'app-aula-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormEntrega, Notificacion, Confirmacion],
  templateUrl: './aula-detalle.html',
  styleUrl: './aula-detalle.scss',
})
export class AulaDetalle implements OnInit {
  recurso: any = null; // Datos del recurso actual
  tipo: string = ''; // 'tarea' o 'material'
  cargando: boolean = true; // Estado de carga de la interfaz
  idTaller: number = 0; // ID del taller actual

  // Modales y Dropdowns
  mostrarModalEntrega: boolean = false;
  mostrarDropdownExt: boolean = false;
  mostrarDropdownAlumnos: boolean = false;

  // Gestión de Alumnos y Asignaciones
  alumnosTaller: UsuarioResponse[] = []; // Alumnos disponibles en el taller
  alumnosSeleccionadosIds: number[] = []; // IDs de alumnos asignados al recurso
  filtroAlumno: string = ''; // Texto para filtrar la lista de alumnos

  // Gestión de Archivos (Enunciados/Material)
  archivosAdjuntos: any[] = []; // Archivos ya subidos
  archivosParaEliminar: number[] = []; // IDs de archivos a borrar al guardar
  nuevosArchivos: File[] = []; // Archivos seleccionados pendientes de subida

  // Datos de Entrega (Vista Alumno)
  entregaRealizada: any = null; // Registro de la entrega del alumno
  archivosEntregaExistentes: any[] = []; // Archivos de la entrega del alumno

  esNuevo: boolean = false; // Indica si se está creando un recurso
  editando: boolean = false; // Indica si el formulario de edición está activo
  form: FormGroup; // Formulario reactivo de edición/creación

  extensionesDisponibles = [
    { label: 'Documentos PDF (.pdf)', value: '.pdf' },
    { label: 'Microsoft Word (.doc, .docx)', value: '.doc, .docx' },
    { label: 'Hojas de Excel (.xlsx)', value: '.xlsx' },
    { label: 'Archivos ZIP/RAR (.zip, .rar)', value: '.zip, .rar' },
    { label: 'Imágenes (.jpg, .png)', value: '.jpg, .png' }
  ];

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
      fechaEntrega: [''],
      extensionesPermitidas: ['.pdf, .doc, .docx']
    });
  }

  /**
   * Cierra los menús desplegables al detectar un click fuera del componente.
   */
  @HostListener('document:click', ['$event'])
  clickOut(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.mostrarDropdownExt = false;
      this.mostrarDropdownAlumnos = false;
    }
  }

  /**
   * Inicializa el componente recuperando parámetros de ruta e identificando el modo (nuevo/lectura).
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
    } else {
      this.cargarDatos(Number(idRecursoRaw));
    }
  }

  /**
   * Carga la lista de alumnos inscritos en el taller.
   */
  private cargarAlumnosDelTaller(): void {
    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        this.alumnosTaller = resp.data.filter(u => u.nombreRol === 'ALUMNO');
      }
    });
  }

  /**
   * Obtiene la información completa del recurso y gestiona la carga de archivos y entregas.
   * @param id ID del recurso a cargar.
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
   * Carga los alumnos asignados a una tarea concreta.
   */
  private cargarAsignaciones(idTarea: number): void {
    this.tareaAsignadaService.listarPorTarea(idTarea).subscribe({
      next: (resp) => {
        this.alumnosSeleccionadosIds = resp.data.map((a: any) => a.idAlumno);
      }
    });
  }

  /**
   * Verifica si el alumno actual ya ha realizado una entrega para la tarea.
   */
  private verificarEntregaExistente(idTarea: number): void {
    const idUsuario = this.tokenService.getId();
    if (!idUsuario) return;

    this.entregaService.listarPorTarea(idTarea).subscribe({
      next: (resp) => {
        const entrega = resp.data.find(e => e.idUsuario === idUsuario);
        if (entrega) {
          this.entregaRealizada = entrega;
          this.recurso.entregado = true;
          this.recurso.calificacion = entrega.calificacion;

          this.archivoEntregaService.listarPorEntrega(entrega.idEntrega).subscribe({
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
      }
    });
  }

  /**
   * Obtiene los archivos adjuntos vinculados al recurso.
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

  // --- Lógica del Selector de Alumnos ---

  toggleDropdownAlumnos(): void {
    this.mostrarDropdownAlumnos = !this.mostrarDropdownAlumnos;
  }

  /**
   * Gestiona la selección/deselección de alumnos para asignar la tarea.
   * @param idAlumno ID del alumno seleccionado.
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
   * Filtra la lista de alumnos basándose en el nombre o apellidos.
   */
  get alumnosFiltrados(): UsuarioResponse[] {
    if (!this.filtroAlumno) return this.alumnosTaller;
    const busqueda = this.filtroAlumno.toLowerCase();
    return this.alumnosTaller.filter(a =>
      (a.nombre + ' ' + a.apellidos).toLowerCase().includes(busqueda)
    );
  }

  // --- Lógica de Formularios y Archivos ---

  toggleDropdownExt(): void { 
    this.mostrarDropdownExt = !this.mostrarDropdownExt; 
  }

  /**
   * Actualiza el string de extensiones permitidas según los checkboxes seleccionados.
   */
  onExtensionChange(event: any): void {
    const value = event.target.value;
    let seleccionadas = this.form.get('extensionesPermitidas')?.value
      ? this.form.get('extensionesPermitidas')?.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "")
      : [];

    if (event.target.checked) {
      if (!seleccionadas.includes(value)) seleccionadas.push(value);
    } else {
      seleccionadas = seleccionadas.filter((ext: string) => ext !== value);
    }
    this.form.patchValue({ extensionesPermitidas: seleccionadas.join(', ') });
  }

  /**
   * Comprueba si una extensión está dentro de la lista permitida para mostrar el checkbox activo.
   */
  estaMarcada(value: string): boolean {
    const current = this.form.get('extensionesPermitidas')?.value || '';
    return current.includes(value);
  }

  /**
   * Valida si el usuario actual tiene rol de Profesor o Administrador.
   */
  esProfesor(): boolean {
    const rol = this.tokenService.getRol();
    return rol === 'PROFESOR' || rol === 'ADMIN';
  }

  /**
   * Activa el modo edición cargando los valores actuales en el formulario reactivo.
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
   * Captura los archivos seleccionados por el usuario para su posterior subida.
   */
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  /**
   * Quita un archivo de la lista de pendientes por subir.
   */
  quitarNuevoArchivo(index: number): void { 
    this.nuevosArchivos.splice(index, 1); 
  }

  /**
   * Marca un archivo existente en el servidor para ser eliminado al guardar.
   */
  marcarParaEliminar(id: number): void {
    this.archivosParaEliminar.push(id);
    this.archivosAdjuntos = this.archivosAdjuntos.filter(a => a.id !== id);
  }

  /**
   * Realiza el guardado integral: Crea/Actualiza el recurso, asigna alumnos y gestiona archivos.
   */
  async guardarTodo(): Promise<void> {
    if (this.form.invalid) return;
    this.cargando = true;

    const v = this.form.value;
    const payload: any = { titulo: v.titulo, idTaller: this.idTaller, visible: this.recurso.visible ?? true };

    if (this.tipo === 'material') {
      payload.contenido = v.descripcion;
    } else {
      payload.descripcion = v.descripcion;
      payload.fechaEntrega = v.fechaEntrega;
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
        this.notificacionService.mostrar({ titulo: 'Error', mensaje: 'No se pudo guardar el recurso', tipo: 'error' });
      }
    });
  }

  /**
   * Elimina el recurso actual tras la confirmación del usuario.
   */
  eliminarRecurso(): void {
    const esTarea = this.tipo === 'tarea';
    const idRecurso = esTarea ? this.recurso.idTarea : this.recurso.id;
    const tituloRecurso = this.recurso.titulo;

    this.notificacionService.confirmar({
      titulo: `¿Eliminar ${this.tipo}?`,
      mensaje: `Estás a punto de borrar permanentemente "${tituloRecurso}" y sus entregas.`,
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar'
    }).then((confirmado) => {
      if (confirmado) {
        this.cargando = true;
        const service: any = esTarea ? this.tareaService : this.materialService;

        service.eliminar(idRecurso).subscribe({
          next: () => {
            this.notificacionService.mostrar({ 
              titulo: 'Eliminado', 
              mensaje: `El ${this.tipo} ha sido borrado correctamente`, 
              tipo: 'exito' 
            });
            this.volver();
          },
          error: () => {
            this.cargando = false;
            this.notificacionService.mostrar({ 
              titulo: 'Error', 
              mensaje: `No se pudo eliminar el ${this.tipo}`, 
              tipo: 'error' 
            });
          }
        });
      }
    });
  }

  /**
   * Cambia el estado de visibilidad del recurso sin entrar en modo edición.
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

  // --- Lógica de Descargas ---

  /**
   * Obtiene y descarga un archivo adjunto del recurso.
   */
  descargarAdjunto(archivo: any): void {
    if (this.editando) return;
    this.archivoService.obtenerBlob(this.tipo === 'tarea' ? 'tarea' : 'material', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  /**
   * Obtiene y descarga un archivo perteneciente a la entrega de un alumno.
   */
  descargarArchivoAlumno(archivo: any): void {
    this.archivoService.obtenerBlob('entrega', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  /**
   * Ejecuta la descarga física del archivo en el navegador.
   */
  private ejecutarDescarga(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- Navegación ---

  /**
   * Finaliza el proceso de guardado limpiando el estado y navegando si es necesario.
   */
  private finalizarGuardado(id: number): void {
    this.editando = false;
    this.nuevosArchivos = [];
    this.archivosParaEliminar = [];

    if (this.esNuevo) {
      this.router.navigate(['/aula-virtual', this.idTaller, this.tipo === 'tarea' ? 'tareas' : 'recursos', id], { replaceUrl: true })
        .then(() => this.cargarDatos(id));
    } else {
      this.cargarDatos(id);
    }
  }

  /**
   * Cancela la edición o creación del recurso.
   */
  cancelar(): void {
    if (this.esNuevo) this.volver();
    else {
      this.editando = false;
      this.cargarDatos(this.recurso.idTarea || this.recurso.id);
    }
  }

  abrirModalEntrega(): void { 
    this.mostrarModalEntrega = true; 
  }

  /**
   * Recarga la información cuando se confirma que una entrega ha sido guardada.
   */
  onEntregaGuardada(): void {
    this.notificacionService.mostrar({ titulo: '¡Hecho!', mensaje: 'Entrega procesada correctamente', tipo: 'exito' });
    this.cargarDatos(this.recurso.idTarea || this.recurso.id);
  }

  /**
   * Navega a la vista de seguimiento y corrección de la tarea.
   */
  irASeguimiento(): void {
    const idTarea = this.recurso.idTarea || this.recurso.id;
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas', idTarea, 'seguimiento']);
  }

  /**
   * Regresa al listado principal de recursos del aula.
   */
  volver(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, this.tipo === 'tarea' ? 'tareas' : 'recursos']);
  }

  /**
   * Redirige al muro en caso de error crítico al cargar datos.
   */
  private redirigirPorError(): void {
    this.router.navigate(['/aula-virtual', this.idTaller, 'muro']);
  }

  /**
   * Calcula el tiempo restante hasta la fecha de entrega.
   * @returns Texto descriptivo del tiempo restante.
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