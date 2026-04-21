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
 * Incluye lógica de seguridad para validar la propiedad de los talleres y la
 * inscripción de alumnos.
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
     * Valida que el usuario sea el profesor del taller o administrador.
     *
     * @param dto Datos de la tarea y lista opcional de IDs de alumnos.
     * @return TareaResponseDTO creada y asignada.
     * @throws ResourceNotFoundException Si el taller o algún alumno no existen.
     * @throws BadRequestException       Si el usuario no tiene permiso para crear
     *                                   tareas en este taller.
     */
    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + dto.getIdTaller()));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No puedes crear tareas en un taller que no impartes.");
        }

        Tarea tarea = tareaMapper.toEntity(dto);
        tarea.setTaller(taller);
        tarea.setFechaPublicacion(LocalDateTime.now());
        tarea.setEstado(EstadoTarea.ABIERTA);
        tarea.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        Tarea tareaGuardada = tareaRepository.save(tarea);

        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            for (Long alumnoId : dto.getAlumnosIds()) {
                asignarTareaAAlumno(tareaGuardada, alumnoId);
            }
        } else {
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
     * Obtiene el listado global de todas las tareas del sistema.
     * Restringido exclusivamente al perfil ADMINISTRADOR.
     *
     * @return Lista de todas las tareas.
     * @throws BadRequestException Si el usuario no es administrador.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarTodas() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("No tienes permiso para ver el listado global de tareas.");
        }
        return tareaRepository.findAll().stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo las tareas de un taller que tienen visible = true.
     * Valida que el alumno solicitante tenga una inscripción activa.
     *
     * @param idTaller ID del taller a consultar.
     * @return Lista de tareas visibles para el alumno.
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
     * Busca una tarea específica por su identificador único con validación de
     * acceso.
     *
     * @param id Identificador único de la tarea.
     * @return TareaResponseDTO con la información detallada.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException       Si el usuario no tiene permisos de acceso
     *                                   (inscripción o propiedad).
     */
    @Transactional(readOnly = true)
    public TareaResponseDTO obtenerPorId(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        String rol = solicitante.getRol().getNombre();

        if (rol.equalsIgnoreCase("ALUMNO")) {
            boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                    solicitante.getId(), tarea.getTaller().getId());
            if (!estaInscrito || !tarea.isVisible()) {
                throw new BadRequestException("No tienes permiso para acceder a esta tarea.");
            }
        } else if (rol.equalsIgnoreCase("PROFESOR") && !rol.equalsIgnoreCase("ADMIN")) {
            boolean esSuTaller = tarea.getTaller().getProfesor() != null &&
                    tarea.getTaller().getProfesor().getId().equals(solicitante.getId());
            if (!esSuTaller) {
                throw new BadRequestException("No puedes ver tareas de talleres ajenos.");
            }
        }

        return tareaMapper.toResponse(tarea);
    }

    /**
     * Lista todas las tareas de un taller (incluyendo ocultas).
     * Uso exclusivo para el profesor titular del taller o administrador.
     *
     * @param idTaller ID del taller.
     * @return Lista completa de tareas del taller.
     * @throws BadRequestException Si el usuario no es el profesor del taller o
     *                             admin.
     */
    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarPorTaller(Long idTaller) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin) {
            Taller taller = tallerRepository.findById(idTaller)
                    .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));
            if (taller.getProfesor() == null || !taller.getProfesor().getId().equals(solicitante.getId())) {
                throw new BadRequestException("No puedes ver la gestión de tareas de un taller ajeno.");
            }
        }

        return tareaRepository.findByTallerId(idTaller).stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de una tarea existente.
     * Verifica que el usuario tenga permisos de edición sobre el taller.
     *
     * @param id  ID de la tarea a modificar.
     * @param dto Nuevos datos de la tarea.
     * @return TareaResponseDTO actualizada.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException       Si el usuario no es el dueño del taller.
     */
    @Transactional
    public TareaResponseDTO actualizar(Long id, TareaRequestDTO dto) {
        Tarea existente = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = existente.getTaller().getProfesor() != null &&
                existente.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No tienes permiso para actualizar esta tarea.");
        }

        existente.setTitulo(dto.getTitulo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setFechaEntrega(dto.getFechaEntrega());
        existente.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        return tareaMapper.toResponse(tareaRepository.save(existente));
    }

    /**
     * Alterna el estado de visibilidad de una tarea.
     *
     * @param id ID de la tarea a modificar.
     * @return TareaResponseDTO con la visibilidad actualizada.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException       Si el usuario no es el profesor titular.
     */
    @Transactional
    public TareaResponseDTO cambiarVisibilidad(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = tarea.getTaller().getProfesor() != null &&
                tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No puedes cambiar la visibilidad de esta tarea.");
        }

        tarea.setVisible(!tarea.isVisible());
        return tareaMapper.toResponse(tareaRepository.save(tarea));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una tarea y todos sus registros y archivos asociados.
     *
     * @param id ID de la tarea a suprimir.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException       Si el usuario no tiene permisos para
     *                                   eliminar el recurso.
     */
    @Transactional
    public void eliminar(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = tarea.getTaller().getProfesor() != null &&
                tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No puedes eliminar esta tarea.");
        }

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