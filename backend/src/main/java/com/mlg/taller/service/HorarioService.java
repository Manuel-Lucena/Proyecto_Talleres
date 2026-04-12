package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.mappers.HorarioMapper;
import com.mlg.taller.repositories.HorarioRepository;
import com.mlg.taller.repositories.TallerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de los horarios asociados a los talleres.
 */
@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final TallerRepository tallerRepository;
    private final HorarioMapper horarioMapper;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo horario para un taller específico.
     * 
     * @param dto Datos del horario.
     * @return Horario guardado.
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException       Si la hora de inicio es posterior a la de
     *                                   fin.
     */
    @Transactional
    public HorarioResponseDTO crear(HorarioRequestDTO dto) {
        if (dto.getHoraInicio().isAfter(dto.getHoraFin())) {
            throw new BadRequestException("La hora de inicio no puede ser posterior a la hora de fin");
        }

        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("No se puede crear el horario: Taller no encontrado"));

        Horario horario = horarioMapper.toEntity(dto);
        horario.setTaller(taller);

        return horarioMapper.toResponse(horarioRepository.save(horario));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene todos los horarios registrados.
     * 
     * @return Lista de horarios.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarTodos() {
        return horarioRepository.findAll().stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista los horarios asignados a un taller concreto.
     * 
     * @param idTaller ID del taller.
     * @return Lista de horarios del taller.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorTaller(Long idTaller) {
        return horarioRepository.findByTallerId(idTaller).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la agenda personalizada de un usuario basada en sus talleres
     * inscritos.
     * * @param idUsuario ID del usuario autenticado.
     * 
     * @return Lista de HorarioResponseDTO con los turnos de sus talleres.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorUsuario(Long idUsuario) {
        return horarioRepository.findHorariosByUsuarioInscrito(idUsuario).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de un horario existente.
     * 
     * @param id  ID del horario a modificar.
     * @param dto Nuevos datos.
     * @return Horario actualizado.
     * @throws ResourceNotFoundException Si el horario no existe.
     * @throws BadRequestException       Si las horas son inconsistentes.
     */
    @Transactional
    public HorarioResponseDTO actualizar(Long id, HorarioRequestDTO dto) {
        if (dto.getHoraInicio().isAfter(dto.getHoraFin())) {
            throw new BadRequestException("Inconsistencia horaria: la hora de inicio es posterior a la de fin");
        }

        Horario h = horarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado con ID: " + id));

        h.setDiaSemana(dto.getDiaSemana());
        h.setHoraInicio(dto.getHoraInicio());
        h.setHoraFin(dto.getHoraFin());

        return horarioMapper.toResponse(horarioRepository.save(h));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un horario del sistema.
     * 
     * @param id ID del horario a borrar.
     * @throws ResourceNotFoundException Si el horario no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!horarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el horario no existe");
        }
        horarioRepository.deleteById(id);
    }
}