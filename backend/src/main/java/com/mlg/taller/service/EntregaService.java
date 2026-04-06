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
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de entregas de tareas.
 */
@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntregaMapper entregaMapper;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva entrega de tarea por parte de un alumno.
     * @param dto Datos del envío.
     * @return DTO de la entrega creada.
     * @throws DuplicateResourceException Si el alumno ya entregó esta tarea previamente.
     * @throws ResourceNotFoundException Si la tarea o el alumno no existen.
     */
    @Transactional
    public EntregaResponseDTO enviar(EntregaRequestDTO dto) {
        entregaRepository.findByTareaIdAndAlumnoId(dto.getIdTarea(), dto.getIdUsuario())
                .ifPresent(e -> {
                    throw new DuplicateResourceException("Ya existe una entrega registrada para este alumno en esta tarea");
                });

        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + dto.getIdTarea()));
        
        Usuario alumno = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

        Entrega entrega = entregaMapper.toEntity(dto);
        entrega.setTarea(tarea);
        entrega.setAlumno(alumno);
        entrega.setFechaEntrega(LocalDateTime.now());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de entregas del sistema.
     * @return Lista de todas las entregas.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarTodas() {
        return entregaRepository.findAll().stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una entrega por su identificador único.
     * @param id Identificador de la entrega.
     * @return DTO de la entrega encontrada.
     * @throws ResourceNotFoundException Si el ID no existe.
     */
    @Transactional(readOnly = true)
    public EntregaResponseDTO buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .map(entregaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la entrega con ID: " + id));
    }

    /**
     * Lista las entregas asociadas a una tarea específica.
     * @param idTarea ID de la tarea a consultar.
     * @return Lista de entregas para dicha tarea.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarPorTarea(Long idTarea) {
        return entregaRepository.findByTareaId(idTarea).stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el contenido textual de una entrega existente (edición del alumno).
     * @param id ID de la entrega.
     * @param dto Nuevos datos.
     * @return DTO actualizado.
     * @throws ResourceNotFoundException Si la entrega no existe.
     */
    @Transactional
    public EntregaResponseDTO actualizar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada para actualizar"));

        entrega.setTextoEntrega(dto.getTextoEntrega());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    /**
     * Asigna una nota y comentarios a una entrega (acción del profesor).
     * @param id ID de la entrega a calificar.
     * @param dto Datos de la calificación.
     * @return Entrega calificada.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException Si la calificación no es válida.
     */
    @Transactional
    public EntregaResponseDTO calificar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede calificar una entrega inexistente"));

        if (dto.getCalificacion() < 0 || dto.getCalificacion() > 10) {
            throw new BadRequestException("La calificación debe estar entre 0 y 10");
        }

        entrega.setCalificacion(dto.getCalificacion());
        entrega.setComentarioProfesor(dto.getComentarioProfesor());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina permanentemente una entrega del sistema.
     * @param id ID de la entrega.
     * @throws ResourceNotFoundException Si la entrega no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!entregaRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: la entrega no existe con ID: " + id);
        }
        entregaRepository.deleteById(id);
    }
}