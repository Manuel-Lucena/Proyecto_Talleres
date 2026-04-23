package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.*;
import com.mlg.taller.model.enums.EstadoTarea;
import com.mlg.taller.model.mappers.TareaMapper;
import com.mlg.taller.repositories.*;
import com.mlg.taller.service.validators.TareaValidator;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de tareas, asignaciones y plazos de entrega.
 * Delega el blindaje de seguridad y reglas de acceso en TareaValidator
 * para garantizar la integridad de los datos entre talleres y alumnos.
 */
@Service
@RequiredArgsConstructor
public class TareaService {

    private final TareaRepository tareaRepository;
    private final TallerRepository tallerRepository;
    private final TareaMapper tareaMapper;
    private final TareaAsignadaRepository tareaAsignadaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final TareaValidator tareaValidator;
    private final FileUtil fileUtil;

    // --- MÉTODOS POST ---

    /**
     * Crea una nueva tarea en un taller y la asigna a los alumnos.
     * Si no se especifican alumnos, se asigna a todos los inscritos activos.
     * * @param dto Datos de la tarea a crear.
     * 
     * @return TareaResponseDTO con la información de la tarea persistida.
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException       Si el usuario no es el profesor del taller
     *                                   o admin.
     */
    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO dto) {
        Taller taller = buscarTallerInterno(dto.getIdTaller());
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();

        tareaValidator.validarGestionTaller(solicitante, taller);

        Tarea tarea = tareaMapper.toEntity(dto);
        tarea.setTaller(taller);
        tarea.setFechaPublicacion(LocalDateTime.now());
        tarea.setEstado(EstadoTarea.ABIERTA);

        Tarea tareaGuardada = tareaRepository.save(tarea);

        asignarTareaMasivaInterno(tareaGuardada, dto.getAlumnosIds(), taller.getId());

        return tareaMapper.toResponse(tareaGuardada);
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todas las tareas del sistema.
     * * @return Lista de todas las tareas registradas.
     * 
     * @throws BadRequestException Si el usuario no posee rol de ADMINISTRADOR.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarTodas() {
        tareaValidator.validarEsAdmin(SecurityUtils.getUsuarioAutenticado());
        return tareaRepository.findAll().stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista las tareas visibles para un alumno en un taller específico.
     * * @param idTaller Identificador del taller.
     * 
     * @return Lista de tareas disponibles para el alumno.
     * @throws BadRequestException Si el alumno no tiene una inscripción activa.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarVisibles(Long idTaller) {
        Long idAlumno = SecurityUtils.getIdUsuarioAutenticado();
        tareaValidator.validarAccesoAlumno(idAlumno, idTaller);

        return tareaRepository.findVisiblesParaAlumno(idTaller, idAlumno).stream()
                .map(tareaMapper::toResponse)
                .toList();
    }

    /**
     * Busca una tarea por su ID validando que el solicitante tenga permiso de
     * acceso.
     * * @param id Identificador de la tarea.
     * 
     * @return Datos detallados de la tarea.
     * @throws ResourceNotFoundException Si la tarea no existe.
     */
    @Transactional(readOnly = true)
    public TareaResponseDTO obtenerPorId(Long id) {
        Tarea tarea = buscarTareaInterna(id);
        tareaValidator.validarAccesoTarea(SecurityUtils.getUsuarioAutenticado(), tarea);
        return tareaMapper.toResponse(tarea);
    }

    /**
     * Obtiene todas las tareas (visibles y ocultas) de un taller específico.
     * * @param idTaller Identificador del taller.
     * 
     * @return Lista completa de tareas para gestión del profesor.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = buscarTallerInterno(idTaller);
        tareaValidator.validarGestionTaller(SecurityUtils.getUsuarioAutenticado(), taller);

        return tareaRepository.findByTallerId(idTaller).stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información básica de una tarea existente.
     * * @param id Identificador de la tarea a modificar.
     * 
     * @param dto Nuevos datos (título, descripción, fecha entrega).
     * @return Tarea actualizada.
     * @throws BadRequestException Si el solicitante no tiene permisos de edición.
     */
    @Transactional
    public TareaResponseDTO actualizar(Long id, TareaRequestDTO dto) {
        Tarea existente = buscarTareaInterna(id);
        tareaValidator.validarPropiedadTarea(SecurityUtils.getUsuarioAutenticado(), existente);

        existente.setTitulo(dto.getTitulo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setFechaEntrega(dto.getFechaEntrega());
        existente.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        return tareaMapper.toResponse(tareaRepository.save(existente));
    }

    /**
     * Alterna la visibilidad de una tarea para los alumnos.
     * * @param id ID de la tarea.
     * 
     * @return Tarea con el nuevo estado de visibilidad.
     */
    @Transactional
    public TareaResponseDTO cambiarVisibilidad(Long id) {
        Tarea tarea = buscarTareaInterna(id);
        tareaValidator.validarPropiedadTarea(SecurityUtils.getUsuarioAutenticado(), tarea);

        tarea.setVisible(!tarea.isVisible());
        return tareaMapper.toResponse(tareaRepository.save(tarea));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una tarea y purga todos los archivos asociados en el sistema de
     * ficheros.
     * * @param id ID de la tarea a eliminar.
     */
    @Transactional
    public void eliminar(Long id) {
        Tarea tarea = buscarTareaInterna(id);
        tareaValidator.validarPropiedadTarea(SecurityUtils.getUsuarioAutenticado(), tarea);

        List<String> paraBorrar = new ArrayList<>();
        tarea.getArchivos().forEach(a -> paraBorrar.add(a.getNombre()));
        tarea.getEntregas().forEach(e -> e.getArchivos().forEach(ae -> paraBorrar.add(ae.getNombre())));

        tareaRepository.delete(tarea);

        paraBorrar.forEach(nom -> fileUtil.eliminar("tareas", nom, false));
        paraBorrar.forEach(nom -> fileUtil.eliminar("entregas", nom, false));
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Realiza una búsqueda interna de una tarea por su identificador único.
     *
     * @param id Identificador de la tarea.
     * @return Entidad Tarea encontrada.
     * @throws ResourceNotFoundException si la tarea no existe en la base de datos.
     */
    private Tarea buscarTareaInterna(Long id) {
        return tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un taller por su identificador único.
     *
     * @param id Identificador del taller.
     * @return Entidad Taller encontrada.
     * @throws ResourceNotFoundException si el taller no existe en la base de datos.
     */
    private Taller buscarTallerInterno(Long id) {
        return tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Gestiona la asignación masiva de tareas basándose en una lista de IDs
     * o en la inscripción actual del taller.
     * 
     * @param tarea      Tarea a asignar.
     * @param alumnosIds Lista opcional de identificadores de alumnos.
     * @param idTaller   Identificador del taller para asignación por defecto.
     */
    private void asignarTareaMasivaInterno(Tarea tarea, List<Long> alumnosIds, Long idTaller) {
        if (alumnosIds != null && !alumnosIds.isEmpty()) {
            alumnosIds.forEach(id -> asignarTareaAAlumno(tarea, id));
        } else {
            inscripcionRepository.findByTallerId(idTaller).stream()
                    .filter(Inscripcion::isActiva)
                    .forEach(i -> asignarTareaAAlumno(tarea, i.getUsuario().getId()));
        }
    }

    /**
     * Registra la asignación individual de una tarea a un alumno específico.
     * 
     * @param tarea    Tarea que se asigna.
     * @param alumnoId Identificador del alumno receptor.
     * @throws ResourceNotFoundException si el alumno no existe.
     */
    private void asignarTareaAAlumno(Tarea tarea, Long alumnoId) {
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con ID: " + alumnoId));

        TareaAsignada asignacion = TareaAsignada.builder()
                .tarea(tarea)
                .alumno(alumno)
                .build();

        tareaAsignadaRepository.save(asignacion);
    }
}