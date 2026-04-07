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
import { FormEntrega } from '../../../../components/forms/form-entrega/form-entrega';

@Component({
  selector: 'app-aula-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormEntrega],
  templateUrl: './aula-detalle.html',
  styleUrl: './aula-detalle.scss',
})
export class AulaDetalle implements OnInit {
  recurso: any = null;
  tipo: string = '';
  cargando = true;
  idTaller: number = 0;

  // Control del Modal Manual
  mostrarModalEntrega: boolean = false;

  // Control del Desplegable de Extensiones
  mostrarDropdownExt: boolean = false;

  // Recurso (Material/Tarea Enunciado)
  archivosAdjuntos: any[] = [];
  archivosParaEliminar: number[] = [];
  nuevosArchivos: File[] = [];

  // Datos de la Entrega del Alumno para la Tabla
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
    private notificacionService: NotificacionService,
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
    }
  }

  ngOnInit() {
    this.idTaller = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.tipo = this.route.snapshot.paramMap.get('tipo') || '';
    const idRecursoRaw = this.route.snapshot.paramMap.get('idRecurso');

    if (!idRecursoRaw || idRecursoRaw === 'nuevo') {
      this.esNuevo = true;
      this.editando = true;
      this.cargando = false;
      this.recurso = { titulo: '' };
    } else {
      this.cargarDatos(Number(idRecursoRaw));
    }
  }

  cargarDatos(id: number) {
    this.cargando = true;
    const service: any = this.tipo === 'tarea' ? this.tareaService : this.materialService;
    service.obtenerPorId(id).subscribe({
      next: (resp: any) => {
        this.recurso = resp.data;
        this.obtenerArchivos(id);
        if (this.tipo === 'tarea' && !this.esProfesor()) {
          this.verificarEntregaExistente(id);
        }
      },
      error: () => this.redirigirPorError()
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
      error: () => { this.archivosAdjuntos = []; this.cargando = false; }
    });
  }

  toggleDropdownExt() {
    this.mostrarDropdownExt = !this.mostrarDropdownExt;
  }

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

  abrirModalEntrega() {
    this.mostrarModalEntrega = true;
  }

  onEntregaGuardada() {
    this.notificacionService.mostrar({
      titulo: '¡Hecho!',
      mensaje: 'Entrega procesada correctamente',
      tipo: 'exito'
    });
    this.cargarDatos(this.recurso.idTarea || this.recurso.id);
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
    const payload: any = { titulo: v.titulo, idTaller: this.idTaller };
    if (this.tipo === 'material') payload.contenido = v.descripcion;
    else {
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
        for (const fId of this.archivosParaEliminar) await lastValueFrom(archService.eliminar(fId));
        for (const file of this.nuevosArchivos) await lastValueFrom(archService.guardar(idActual, file));
        this.finalizarGuardado(idActual);
      },
      error: () => this.cargando = false
    });
  }

  toggleVisibilidadRapida() {
    const id = this.recurso.idTarea || this.recurso.id;
    const service: any = this.tipo === 'tarea' ? this.tareaService : this.materialService;

    if (!id) return;

    service.cambiarVisibilidad(id).subscribe({
      next: (resp: any) => {
        // Actualizamos el estado local
        this.recurso.visible = resp.data.visible;

        // Forzamos la detección de cambios para que el ojo se tache/destache
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error al cambiar visibilidad", err);
      }
    });
  }

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