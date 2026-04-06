package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.InscripcionMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de inscripciones de usuarios en talleres.
 */
@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionMapper inscripcionMapper;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva inscripción de un usuario en un taller.
     * @param dto Datos de la inscripción.
     * @return Inscripción guardada.
     * @throws ResourceNotFoundException Si el usuario o el taller no existen.
     */
    @Transactional
    public InscripcionResponseDTO inscribir(InscripcionRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));
        
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + dto.getIdTaller()));

        Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
        return inscripcionMapper.toResponse(inscripcionRepository.save(inscripcion));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de inscripciones.
     * @return Lista de todas las inscripciones.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarTodas() {
        return inscripcionRepository.findAll().stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una inscripción por su identificador único.
     * @param id Identificador de la inscripción.
     * @return Inscripción encontrada.
     * @throws ResourceNotFoundException Si la inscripción no existe.
     */
    @Transactional(readOnly = true)
    public InscripcionResponseDTO buscarPorId(Long id) {
        return inscripcionRepository.findById(id)
                .map(inscripcionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada con ID: " + id));
    }

    /**
     * Lista todas las inscripciones asociadas a un usuario concreto.
     * @param idUsuario ID del usuario.
     * @return Lista de sus inscripciones.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarPorUsuario(Long idUsuario) {
        return inscripcionRepository.findByUsuarioId(idUsuario).stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de una inscripción existente.
     * @param id ID de la inscripción a modificar.
     * @param dto Nuevos datos.
     * @return Inscripción actualizada.
     * @throws ResourceNotFoundException Si la inscripción no existe.
     */
    @Transactional
    public InscripcionResponseDTO actualizar(Long id, InscripcionRequestDTO dto) {
        Inscripcion existente = inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la inscripción para actualizar con ID: " + id));

        existente.setMontoPagado(dto.getMontoPagado());
        existente.setOrderId(dto.getOrderId());

        return inscripcionMapper.toResponse(inscripcionRepository.save(existente));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina permanentemente una inscripción del sistema.
     * @param id ID de la inscripción a borrar.
     * @throws ResourceNotFoundException Si la inscripción no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!inscripcionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se pudo eliminar: ID " + id + " no encontrado");
        }
        inscripcionRepository.deleteById(id);
    }
}