package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.model.entities.Mensaje;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.MensajeMapper;
import com.mlg.taller.repositories.MensajeRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.service.validators.MensajeValidator;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de mensajes en los foros de los talleres.
 * Utiliza MensajeValidator para blindar la comunicación y asegurar que solo
 * los perfiles con autoridad (Admin/Profesor) gestionen el historial.
 */
@Service
@RequiredArgsConstructor
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final TallerRepository tallerRepository;
    private final MensajeValidator mensajeValidator;
    private final MensajeMapper mensajeMapper;

    // --- MÉTODOS POST ---

    /**
     * Registra y envía un nuevo mensaje dentro de un taller.
     * * @param dto Datos del mensaje (idTaller, contenido).
     * 
     * @return MensajeResponseDTO persistido.
     * @throws ResourceNotFoundException Si el taller no existe.
     */
    @Transactional
    public MensajeResponseDTO enviar(MensajeRequestDTO dto) {
        Taller taller = buscarTallerInterno(dto.getIdTaller());
        Usuario usuario = SecurityUtils.getUsuarioAutenticado();

        mensajeValidator.validarAccesoATaller(usuario, taller);

        Mensaje mensaje = mensajeMapper.toEntity(dto);
        mensaje.setTaller(taller);
        mensaje.setAutor(usuario);
        mensaje.setFechaEnvio(LocalDateTime.now());

        return mensajeMapper.toResponse(mensajeRepository.save(mensaje));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todos los mensajes registrados.
     * * @return Lista de mensajes globales.
     * 
     * @throws BadRequestException Si el solicitante no es ADMINISTRADOR.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarTodos() {
        mensajeValidator.validarEsAdmin(SecurityUtils.getUsuarioAutenticado());

        return mensajeRepository.findAll().stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista cronológicamente los mensajes de un taller específico.
     * * @param idTaller ID del taller a consultar.
     * 
     * @return Lista de mensajes ordenados por fecha de envío.
     * @throws ResourceNotFoundException Si el taller no existe.
     */
    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = buscarTallerInterno(idTaller);
        mensajeValidator.validarAccesoATaller(SecurityUtils.getUsuarioAutenticado(), taller);

        return mensajeRepository.findByTallerIdOrderByFechaEnvioAsc(idTaller).stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un mensaje del sistema.
     * Por seguridad, un mensaje SOLO puede ser eliminado por el profesor del taller
     * o el administrador. Los alumnos no tienen permiso de borrado.
     * * @param id ID del mensaje a borrar.
     * 
     * @throws ResourceNotFoundException Si el mensaje no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado con ID: " + id));

        mensajeValidator.validarPermisoBorrado(SecurityUtils.getUsuarioAutenticado(), mensaje);

        mensajeRepository.delete(mensaje);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---


    /**
     * Busca un taller en la base de datos a partir de su identificador único.
     *
     * @param idTaller Identificador único del taller a localizar.
     * @return Entidad Taller recuperada del repositorio.
     * @throws ResourceNotFoundException si no se encuentra ningún taller con el ID
     *                                   proporcionado.
     */
    private Taller buscarTallerInterno(Long idTaller) {
        return tallerRepository.findById(idTaller)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + idTaller));
    }
}