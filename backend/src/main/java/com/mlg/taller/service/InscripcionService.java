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
import java.util.Map;
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
    private final EmailService emailService;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva inscripción de un usuario en un taller.
     * * @param dto Datos de la inscripción.
     * 
     * @return Inscripción guardada.
     * @throws ResourceNotFoundException Si el usuario o el taller no existen.
     */
    @Transactional
    public InscripcionResponseDTO inscribir(InscripcionRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + dto.getIdTaller()));

        Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
        InscripcionResponseDTO response = inscripcionMapper.toResponse(inscripcionRepository.save(inscripcion));

        emailService.enviarCorreo(usuario.getEmail(), "¡Inscripción Confirmada!", "confirmacion-inscripcion",
                Map.of("usuario", usuario, "taller", taller));

        return response;
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de inscripciones.
     * * @return Lista de todas las inscripciones.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarTodas() {
        return inscripcionRepository.findAll().stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el listado de alumnos matriculados en un taller específico.
     * Este método permite al administrador consultar la "Lista de Clase" de
     * cualquier actividad.
     * * @param idTaller Identificador único del taller a consultar.
     * * @return Lista de DTOs con la información de los alumnos y sus estados de
     * inscripción.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarPorTaller(Long idTaller) {
        return inscripcionRepository.findByTallerId(idTaller).stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una inscripción por su identificador único.
     * * @param id Identificador de la inscripción.
     * 
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
     * * @param idUsuario ID del usuario.
     * 
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
     * * @param id ID de la inscripción a modificar.
     * 
     * @param dto Nuevos datos.
     * @return Inscripción actualizada.
     * @throws ResourceNotFoundException Si la inscripción no existe.
     */
    @Transactional
    public InscripcionResponseDTO actualizar(Long id, InscripcionRequestDTO dto) {
        Inscripcion existente = inscripcionRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException("No existe la inscripción para actualizar con ID: " + id));

        existente.setMontoPagado(dto.getMontoPagado());
        existente.setOrderId(dto.getOrderId());

        return inscripcionMapper.toResponse(inscripcionRepository.save(existente));
    }

    /**
     * Alterna el estado de activación de una inscripción (Toggle).
     * Permite al administrador suspender o reactivar el acceso de un alumno a un
     * taller de forma manual, sin necesidad de eliminar el registro de la base de
     * datos.
     * * @param id Identificador único de la inscripción a modificar.
     * 
     * @return DTO con la información actualizada, reflejando el nuevo estado de la
     *         propiedad 'activa'.
     * @throws ResourceNotFoundException Si no se encuentra una inscripción con el
     *                                   ID proporcionado.
     */
    @Transactional
    public InscripcionResponseDTO cambiarEstado(Long id) {
        Inscripcion inscripcion = inscripcionRepository.findByIdIncludingInactive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripcion no encontrada con ID: " + id));

        // Cambiamos el estado (Toggle)
        inscripcion.setActiva(!inscripcion.isActiva());
        Inscripcion guardada = inscripcionRepository.save(inscripcion);

        // DETERMINAR ASUNTO Y PLANTILLA
        String asunto;
        String plantilla;

        if (guardada.isActiva()) {
            asunto = "¡Tu inscripción ha sido reactivada!";
            plantilla = "confirmacion-inscripcion"; // O una específica de reactivación
        } else {
            asunto = "Notificación: Tu inscripción ha sido suspendida";
            plantilla = "baja-taller"; // Reutilizamos la de baja o usa una de 'suspension'
        }

        emailService.enviarCorreo(
                guardada.getUsuario().getEmail(),
                asunto,
                plantilla,
                Map.of("usuario", guardada.getUsuario(), "taller", guardada.getTaller()));

        return inscripcionMapper.toResponse(guardada);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina permanentemente una inscripción del sistema.
     * * @param id ID de la inscripción a borrar.
     * 
     * @throws ResourceNotFoundException Si la inscripción no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Inscripcion inscripcion = inscripcionRepository.findByIdIncludingInactive(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo eliminar: ID " + id + " no encontrado"));

        // Capturamos datos para el mail antes de borrar definitivamente
        Usuario usuario = inscripcion.getUsuario();
        Taller taller = inscripcion.getTaller();

        inscripcionRepository.delete(inscripcion);

        emailService.enviarCorreo(usuario.getEmail(), "Notificación de baja de taller", "baja-taller",
                Map.of("usuario", usuario, "taller", taller));
    }
}