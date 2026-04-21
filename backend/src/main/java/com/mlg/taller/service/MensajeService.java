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
     * * @param dto Datos del mensaje a enviar.
     * 
     * @return Mensaje enviado y persistido.
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException       Si el usuario no está inscrito o activo.
     */
    @Transactional
    public MensajeResponseDTO enviar(MensajeRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Usuario usuario = SecurityUtils.getUsuarioAutenticado();

        boolean esAdmin = usuario.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esProfeDelTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(usuario.getId());
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(usuario.getId(),
                dto.getIdTaller());

        if (!esAdmin && !esProfeDelTaller && !estaInscrito) {
            throw new BadRequestException("Acceso denegado: No tienes permisos en este taller.");
        }

        Mensaje mensaje = mensajeMapper.toEntity(dto);
        mensaje.setTaller(taller);
        mensaje.setAutor(usuario);
        mensaje.setFechaEnvio(LocalDateTime.now());
        return mensajeMapper.toResponse(mensajeRepository.save(mensaje));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de todos los mensajes del sistema.
     * 
     * @return Lista de mensajes globales.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarTodos() {
        return mensajeRepository.findAll().stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista cronológicamente los mensajes pertenecientes a un taller específico.
     * * @param idTaller ID del taller a consultar.
     * 
     * @return Lista de mensajes del taller ordenados por fecha.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Usuario usuario = SecurityUtils.getUsuarioAutenticado();

        boolean esAdmin = usuario.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esProfeDelTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(usuario.getId());
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(usuario.getId(),
                idTaller);

        if (!esAdmin && !esProfeDelTaller && !estaInscrito) {
            throw new BadRequestException("No tienes permiso para ver el historial de este taller.");
        }

        return mensajeRepository.findByTallerIdOrderByFechaEnvioAsc(idTaller).stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un mensaje del sistema por su identificador.
     * 
     * @param id ID del mensaje a borrar.
     * @throws ResourceNotFoundException Si el mensaje no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!mensajeRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El mensaje no existe con ID: " + id);
        }
        mensajeRepository.deleteById(id);
    }
}