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

@Component({
  selector: 'app-aula-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormEntrega, Notificacion, Confirmacion],
  templateUrl: './aula-detalle.html',
  styleUrl: './aula-detalle.scss',
})
export class AulaDetalle implements OnInit {
  recurso: any = null;
  tipo: string = '';
  cargando = true;
  idTaller: number = 0;

  // Modales y Dropdowns
  mostrarModalEntrega: boolean = false;
  mostrarDropdownExt: boolean = false;
  mostrarDropdownAlumnos: boolean = false;

  // Gestión de Alumnos y Asignaciones
  alumnosTaller: UsuarioResponse[] = [];
  alumnosSeleccionadosIds: number[] = [];
  filtroAlumno: string = '';

  // Recurso (Material/Tarea Enunciado)
  archivosAdjuntos: any[] = [];
  archivosParaEliminar: number[] = [];
  nuevosArchivos: File[] = [];

  // Datos de la Entrega del Alumno
  entregaRealizada: any = null;
  archivosEntregaExistentes: any[] = [];

  esNuevo: boolean = false;
  editando: boolean = false;
  form: FormGroup;

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

  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.mostrarDropdownExt = false;
      this.mostrarDropdownAlumnos = false;
    }
  }

  ngOnInit() {
    this.idTaller = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.tipo = this.route.snapshot.paramMap.get('tipo') || '';
    const idRecursoRaw = this.route.snapshot.paramMap.get('idRecurso');

    // Si es profesor, cargamos la lista de alumnos del taller para el selector
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

  private cargarAlumnosDelTaller() {
    this.usuarioService.listarPorTaller(this.idTaller).subscribe({
      next: (resp) => {
        // Filtramos para quedarnos solo con alumnos (ID_ROL suele ser 2 o según tu lógica de nombreRol)
        this.alumnosTaller = resp.data.filter(u => u.nombreRol === 'ALUMNO');
      }
    });
  }

  cargarDatos(id: number) {
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
            // Si es profesor, cargamos quién tiene asignada esta tarea
            this.cargarAsignaciones(id);
          }
        }
      },
      error: () => this.redirigirPorError()
    });
  }

  private cargarAsignaciones(idTarea: number) {
    this.tareaAsignadaService.listarPorTarea(idTarea).subscribe({
      next: (resp) => {
        this.alumnosSeleccionadosIds = resp.data.map((a: any) => a.idAlumno);
      }
    });
  }

  private verificarEntregaExistente(idTarea: number) {
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

  private obtenerArchivos(id: number) {
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
  toggleDropdownAlumnos() {
    this.mostrarDropdownAlumnos = !this.mostrarDropdownAlumnos;
  }

  onAlumnoToggle(idAlumno: number) {
    const index = this.alumnosSeleccionadosIds.indexOf(idAlumno);
    if (index > -1) {
      this.alumnosSeleccionadosIds.splice(index, 1);
    } else {
      this.alumnosSeleccionadosIds.push(idAlumno);
    }
  }

  get alumnosFiltrados() {
    if (!this.filtroAlumno) return this.alumnosTaller;
    const busqueda = this.filtroAlumno.toLowerCase();
    return this.alumnosTaller.filter(a =>
      (a.nombre + ' ' + a.apellidos).toLowerCase().includes(busqueda)
    );
  }

  // --- Lógica de Formularios y Archivos ---
  toggleDropdownExt() { this.mostrarDropdownExt = !this.mostrarDropdownExt; }

  onExtensionChange(event: any) {
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

  estaMarcada(value: string): boolean {
    const current = this.form.get('extensionesPermitidas')?.value || '';
    return current.includes(value);
  }

  esProfesor(): boolean {
    const rol = this.tokenService.getRol();
    return rol === 'PROFESOR' || rol === 'ADMIN';
  }

  activarEdicion() {
    this.editando = true;
    this.form.patchValue({
      titulo: this.recurso.titulo,
      descripcion: this.tipo === 'tarea' ? this.recurso.descripcion : this.recurso.contenido,
      fechaEntrega: this.recurso.fechaEntrega ? this.recurso.fechaEntrega.substring(0, 16) : '',
      extensionesPermitidas: this.recurso.extensionesPermitidas || '.pdf, .doc, .docx'
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.nuevosArchivos.push(...Array.from(event.target.files) as File[]);
      event.target.value = '';
    }
  }

  quitarNuevoArchivo(index: number) { this.nuevosArchivos.splice(index, 1); }

  marcarParaEliminar(id: number) {
    this.archivosParaEliminar.push(id);
    this.archivosAdjuntos = this.archivosAdjuntos.filter(a => a.id !== id);
  }

  async guardarTodo() {
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

        // 1. Sincronizar asignaciones de alumnos si es tarea
        if (this.tipo === 'tarea') {
          await lastValueFrom(this.tareaAsignadaService.actualizarAsignaciones(idActual, this.alumnosSeleccionadosIds));
        }

        // 2. Eliminar archivos marcados
        for (const fId of this.archivosParaEliminar) {
          await lastValueFrom(archService.eliminar(fId));
        }

        // 3. Subir nuevos archivos
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

 // --- ELIMINAR CON VUESTRO MODAL DE CONFIRMACIÓN ---
  eliminarRecurso() {
    const esTarea = this.tipo === 'tarea';
    const idRecurso = esTarea ? this.recurso.idTarea : this.recurso.id;
    const tituloRecurso = this.recurso.titulo;

    this.notificacionService.confirmar({
      titulo: `¿Eliminar ${this.tipo}?`,
      mensaje: `Estás a punto de borrar permanentemente "${tituloRecurso}" y sus entregas. Esta acción no se puede deshacer.`,
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

  toggleVisibilidadRapida() {
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

  // --- Descargas ---
  descargarAdjunto(archivo: any) {
    if (this.editando) return;
    this.archivoService.obtenerBlob(this.tipo === 'tarea' ? 'tarea' : 'material', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  descargarArchivoAlumno(archivo: any) {
    this.archivoService.obtenerBlob('entrega', archivo.id).subscribe({
      next: (blob) => this.ejecutarDescarga(blob, archivo.nombre)
    });
  }

  private ejecutarDescarga(blob: Blob, nombre: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- Navegación ---
  private finalizarGuardado(id: number) {
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

  cancelar() {
    if (this.esNuevo) this.volver();
    else {
      this.editando = false;
      this.cargarDatos(this.recurso.idTarea || this.recurso.id);
    }
  }

  abrirModalEntrega() { this.mostrarModalEntrega = true; }

  onEntregaGuardada() {
    this.notificacionService.mostrar({ titulo: '¡Hecho!', mensaje: 'Entrega procesada correctamente', tipo: 'exito' });
    this.cargarDatos(this.recurso.idTarea || this.recurso.id);
  }

  irASeguimiento() {
    const idTarea = this.recurso.idTarea || this.recurso.id;
    this.router.navigate(['/aula-virtual', this.idTaller, 'tareas', idTarea, 'seguimiento']);
  }

  volver() {
    this.router.navigate(['/aula-virtual', this.idTaller, this.tipo === 'tarea' ? 'tareas' : 'recursos']);
  }

  private redirigirPorError() {
    this.router.navigate(['/aula-virtual', this.idTaller, 'muro']);
  }

  calcularTiempo(fechaFin: string): string {
    if (!fechaFin) return 'Sin fecha límite';
    const diff = new Date(fechaFin).getTime() - new Date().getTime();
    if (diff < 0) return `Plazo finalizado`;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${dias} días y ${horas} horas restantes`;
  }
}