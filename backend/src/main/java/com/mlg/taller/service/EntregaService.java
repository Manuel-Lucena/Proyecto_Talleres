package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.DuplicateResourceException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.EntregaMapper;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de entregas de tareas.
 * Implementa un blindaje estricto para proteger la integridad de las
 * calificaciones
 * y la privacidad de los trabajos entre alumnos.
 */
@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final EntregaMapper entregaMapper;
    private final InscripcionRepository inscripcionRepository;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva entrega de tarea validando requisitos de acceso y
     * visibilidad.
     * * @param dto Datos del envío (idTarea, textoEntrega).
     * 
     * @return EntregaResponseDTO de la entrega creada.
     * @throws ResourceNotFoundException  Si la tarea no existe.
     * @throws BadRequestException        Si la tarea está oculta o el alumno no
     *                                    está inscrito.
     * @throws DuplicateResourceException Si el alumno ya envió un trabajo para esta
     *                                    tarea.
     */
    @Transactional
    public EntregaResponseDTO enviar(EntregaRequestDTO dto) {
        Usuario alumno = SecurityUtils.getUsuarioAutenticado();

        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + dto.getIdTarea()));

        // 1. Validar que la tarea esté publicada
        if (!tarea.isVisible()) {
            throw new BadRequestException("No puedes entregar trabajos para una tarea que aún no ha sido publicada.");
        }

        // 2. Validar inscripción activa
        boolean puedeEntregar = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                alumno.getId(), tarea.getTaller().getId());
        if (!puedeEntregar) {
            throw new BadRequestException("No tienes una inscripción activa en el taller correspondiente.");
        }

        // 3. Evitar duplicados
        entregaRepository.findByTareaIdAndAlumnoId(dto.getIdTarea(), alumno.getId())
                .ifPresent(e -> {
                    throw new DuplicateResourceException("Ya existe una entrega registrada para ti en esta tarea.");
                });

        Entrega entrega = entregaMapper.toEntity(dto);
        entrega.setTarea(tarea);
        entrega.setAlumno(alumno);
        entrega.setFechaEntrega(LocalDateTime.now());

        // Blindaje: Forzamos que la entrega nazca sin nota ni feedback
        entrega.setCalificacion(null);
        entrega.setComentarioProfesor(null);

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todas las entregas del sistema.
     * * @return Lista de todas las entregas registradas.
     * 
     * @throws BadRequestException Si el usuario no es ADMINISTRADOR.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarTodas() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Acceso denegado: Solo el administrador puede ver el listado global.");
        }
        return entregaRepository.findAll().stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una entrega validando permisos de privacidad (Dueño, Profesor o
     * Admin).
     * * @param id Identificador de la entrega.
     * 
     * @return EntregaResponseDTO encontrada.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException       Si el usuario intenta ver una entrega ajena
     *                                   sin ser su profesor.
     */
    @Transactional(readOnly = true)
    public EntregaResponseDTO buscarPorId(Long id) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esElDueno = entrega.getAlumno().getId().equals(solicitante.getId());
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null &&
                entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esElDueno && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No tienes permiso para visualizar esta entrega.");
        }

        return entregaMapper.toResponse(entrega);
    }

    /**
     * Lista las entregas de una tarea validando que el solicitante sea el profesor
     * titular.
     * * @param idTarea ID de la tarea a consultar.
     * 
     * @return Lista de entregas de la tarea.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException       Si el usuario no es el profesor del taller
     *                                   o administrador.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarPorTarea(Long idTarea) {
        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + idTarea));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = tarea.getTaller().getProfesor() != null &&
                tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: Solo el profesor del taller puede listar estas entregas.");
        }

        return entregaRepository.findByTareaId(idTarea).stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el contenido de una entrega validando que no esté calificada.
     * * @param id ID de la entrega a modificar.
     * 
     * @param dto Nuevos datos.
     * @return EntregaResponseDTO actualizada.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException       Si la entrega ya tiene nota o el usuario no
     *                                   es el dueño.
     */
    @Transactional
    public EntregaResponseDTO actualizar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();

        if (!entrega.getAlumno().getId().equals(solicitante.getId())) {
            throw new BadRequestException("Acceso denegado: No puedes editar el trabajo de otro alumno.");
        }

        if (entrega.getCalificacion() != null) {
            throw new BadRequestException(
                    "Integridad protegida: No se puede editar una entrega que ya ha sido calificada.");
        }

        entrega.setTextoEntrega(dto.getTextoEntrega());
        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    /**
     * Asigna calificación y feedback a una entrega.
     * * @param id ID de la entrega a calificar.
     * 
     * @param dto Datos con la nota y comentarios.
     * @return Entrega calificada.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException       Si la nota está fuera de rango o el usuario
     *                                   no es el profesor titular.
     */
    @Transactional
    public EntregaResponseDTO calificar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada para calificar"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null &&
                entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: Solo el profesor titular puede calificar esta entrega.");
        }

        entrega.setCalificacion(dto.getCalificacion());
        entrega.setComentarioProfesor(dto.getComentarioProfesor());
        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una entrega del sistema.
     * * @param id ID de la entrega a borrar.
     * 
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException       Si el usuario no tiene permisos de gestión
     *                                   (Admin/Profe).
     */
    @Transactional
    public void eliminar(Long id) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null &&
                entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException(
                    "Acceso denegado: Solo el profesor o administrador pueden eliminar entregas.");
        }

        entregaRepository.delete(entrega);
    }
}