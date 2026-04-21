package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.*;
import com.mlg.taller.model.enums.EstadoTarea;
import com.mlg.taller.model.mappers.TareaMapper;
import com.mlg.taller.repositories.*;
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
    private final FileUtil fileUtil;

    // --- MÉTODOS POST ---

    /**
     * Crea una nueva tarea y la asigna automáticamente a los alumnos
     * correspondientes.
     * 
     * @param dto Datos de la tarea y lista opcional de IDs de alumnos.
     * @return Tarea creada y asignada.
     * @throws ResourceNotFoundException Si el taller o algún alumno no existen.
     */
    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede crear la tarea: Taller no encontrado con ID: " + dto.getIdTaller()));

        Tarea tarea = tareaMapper.toEntity(dto);
        tarea.setTaller(taller);
        tarea.setFechaPublicacion(LocalDateTime.now());
        tarea.setEstado(EstadoTarea.ABIERTA);
        tarea.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        Tarea tareaGuardada = tareaRepository.save(tarea);

        // Si se especifican alumnos, se asigna a ellos; si no, a todos los inscritos en
        // el taller
        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            for (Long alumnoId : dto.getAlumnosIds()) {
                asignarTareaAAlumno(tareaGuardada, alumnoId);
            }
        } else {
            // Filtrar directamente por activa = true
            List<Inscripcion> inscripcionesActivas = inscripcionRepository.findByTallerId(taller.getId())
                    .stream()
                    .filter(Inscripcion::isActiva)
                    .toList();

            for (Inscripcion inscripcion : inscripcionesActivas) {
                asignarTareaAAlumno(tareaGuardada, inscripcion.getUsuario().getId());
            }
        }

        return tareaMapper.toResponse(tareaGuardada);
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de tareas del sistema.
     * 
     * @return Lista de todas las tareas.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarTodas() {
        return tareaRepository.findAll().stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo las tareas de un taller que tienen visible = true
     * * @param idTaller ID del taller a consultar.
     * 
     * @return Lista de tareas visibles y asignadas al alumno identificado por el
     *         Token.
     * @throws BadRequestException Si el alumno no posee una inscripción activa en
     *                             el taller.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarVisibles(Long idTaller) {
    
        Long idAlumno = SecurityUtils.getIdUsuarioAutenticado();

        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(idAlumno, idTaller);
        if (!estaInscrito) {
            throw new BadRequestException(
                    "Acceso denegado: No puedes listar tareas de un taller en el que no estás inscrito.");
        }

        return tareaRepository.findVisiblesParaAlumno(idTaller, idAlumno).stream()
                .map(tareaMapper::toResponse)
                .toList();
    }

   /**
     * Busca una tarea específica por su identificador único.
     * * @param id Identificador único de la tarea.
     * @return TareaResponseDTO con la información detallada de la actividad.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException        Si el alumno no está inscrito en el taller correspondiente.
     */
    @Transactional(readOnly = true)
    public TareaResponseDTO obtenerPorId(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));

        Long idAlumno = SecurityUtils.getIdUsuarioAutenticado();

        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                idAlumno, tarea.getTaller().getId());

        if (!estaInscrito) {
            throw new BadRequestException("Acceso denegado: No figuras como alumno activo en el taller de esta tarea.");
        }

        return tareaMapper.toResponse(tarea);
    }

    /**
     * Lista todas las tareas pertenecientes a un taller específico.
     * 
     * @param idTaller ID del taller.
     * @return Lista de tareas del taller.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarPorTaller(Long idTaller) {
        return tareaRepository.findByTallerId(idTaller).stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de una tarea existente.
     * 
     * @param id  ID de la tarea a modificar.
     * @param dto Nuevos datos.
     * @return Tarea actualizada.
     * @throws ResourceNotFoundException Si la tarea o el taller no existen.
     */
    @Transactional
    public TareaResponseDTO actualizar(Long id, TareaRequestDTO dto) {
        Tarea existente = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede actualizar: Tarea no encontrada con ID: " + id));

        existente.setTitulo(dto.getTitulo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setFechaEntrega(dto.getFechaEntrega());
        existente.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No se puede actualizar: Nuevo taller no encontrado con ID: " + dto.getIdTaller()));
            existente.setTaller(nuevoTaller);
        }

        return tareaMapper.toResponse(tareaRepository.save(existente));
    }

    /**
     * Alterna el estado de visibilidad de una tarea.
     * Permite al profesor gestionar cuándo los alumnos pueden empezar a ver la
     * actividad.
     * * @param id ID de la tarea a modificar.
     * 
     * @return Tarea con el nuevo estado de visibilidad.
     * @throws ResourceNotFoundException Si la tarea no existe.
     */
    @Transactional
    public TareaResponseDTO cambiarVisibilidad(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede cambiar visibilidad: Tarea no encontrada con ID: " + id));

        tarea.setVisible(!tarea.isVisible());
        return tareaMapper.toResponse(tareaRepository.save(tarea));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una tarea y sus registros asociados.
     * 
     * @param id ID de la tarea a borrar.
     * @throws ResourceNotFoundException Si la tarea no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

        List<String> paraBorrar = new ArrayList<>();
        tarea.getArchivos().forEach(a -> paraBorrar.add(a.getNombre()));
        tarea.getEntregas().forEach(e -> e.getArchivos().forEach(ae -> paraBorrar.add(ae.getNombre())));

        tareaRepository.delete(tarea);

        paraBorrar.forEach(nom -> fileUtil.eliminar("tareas", nom, false));
        paraBorrar.forEach(nom -> fileUtil.eliminar("entregas", nom, false));
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Crea un registro de asignación para un alumno específico.
     * 
     * @param tarea    Tarea a asignar.
     * @param alumnoId ID del alumno.
     * @throws ResourceNotFoundException Si el alumno no existe.
     */
    private void asignarTareaAAlumno(Tarea tarea, Long alumnoId) {
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se pudo asignar tarea: Alumno no encontrado con ID: " + alumnoId));

        TareaAsignada asignacion = TareaAsignada.builder()
                .tarea(tarea)
                .alumno(alumno)
                .build();

        tareaAsignadaRepository.save(asignacion);
    }
}