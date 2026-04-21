package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.model.entities.Mensaje;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.MensajeMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.MensajeRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de mensajes en los foros de los talleres.
 * Implementa reglas de seguridad para asegurar que la comunicación se mantenga
 * dentro de los límites de cada taller y sus participantes.
 */
@Service
@RequiredArgsConstructor
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final TallerRepository tallerRepository;
    private final MensajeMapper mensajeMapper;
    private final InscripcionRepository inscripcionRepository;

    // --- MÉTODOS POST ---

    /**
     * Registra y envía un nuevo mensaje dentro de un taller.
     * Valida que el emisor sea el profesor del taller, un alumno inscrito o administrador.
     *
     * @param dto Datos del mensaje a enviar.
     * @return MensajeResponseDTO persistido.
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException Si el usuario no tiene relación activa con el taller.
     */
    @Transactional
    public MensajeResponseDTO enviar(MensajeRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Usuario usuario = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = usuario.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esProfeDelTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(usuario.getId());
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(usuario.getId(), dto.getIdTaller());

        if (!esAdmin && !esProfeDelTaller && !estaInscrito) {
            throw new BadRequestException("Acceso denegado: No puedes enviar mensajes a un taller donde no participas.");
        }

        Mensaje mensaje = mensajeMapper.toEntity(dto);
        mensaje.setTaller(taller);
        mensaje.setAutor(usuario);
        mensaje.setFechaEnvio(LocalDateTime.now());
        return mensajeMapper.toResponse(mensajeRepository.save(mensaje));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todos los mensajes registrados.
     * Uso exclusivo para el perfil ADMINISTRADOR.
     *
     * @return Lista de mensajes globales.
     * @throws BadRequestException Si el solicitante no es administrador.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarTodos() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("No tienes permiso para ver el historial global de mensajería.");
        }
        return mensajeRepository.findAll().stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista cronológicamente los mensajes de un taller.
     * Verifica que el usuario tenga acceso legítimo al taller.
     *
     * @param idTaller ID del taller a consultar.
     * @return Lista de mensajes ordenados por fecha.
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException Si el usuario no participa en el taller.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Usuario usuario = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = usuario.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esProfeDelTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(usuario.getId());
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(usuario.getId(), idTaller);

        if (!esAdmin && !esProfeDelTaller && !estaInscrito) {
            throw new BadRequestException("No tienes permiso para ver el historial de este taller.");
        }

        return mensajeRepository.findByTallerIdOrderByFechaEnvioAsc(idTaller).stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un mensaje del sistema.
     * Un mensaje solo puede ser eliminado por su autor, el profesor del taller o el administrador.
     *
     * @param id ID del mensaje a borrar.
     * @throws ResourceNotFoundException Si el mensaje no existe.
     * @throws BadRequestException Si el usuario no tiene permisos para eliminar este mensaje específico.
     */
    @Transactional
    public void eliminar(Long id) {
        Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado con ID: " + id));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esAutor = mensaje.getAutor().getId().equals(solicitante.getId());
        boolean esProfeDelTaller = mensaje.getTaller().getProfesor() != null && 
                                   mensaje.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esAutor && !esProfeDelTaller) {
            throw new BadRequestException("No tienes permiso para eliminar este mensaje.");
        }

        mensajeRepository.delete(mensaje);
    }
}