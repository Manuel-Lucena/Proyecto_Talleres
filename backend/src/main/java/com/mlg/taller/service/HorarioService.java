package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.mappers.HorarioMapper;
import com.mlg.taller.repositories.HorarioRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.service.validators.HorarioValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de los horarios asociados a los talleres.
 *
 * Centraliza la planificación temporal de las actividades, delegando las
 * validaciones de seguridad y consistencia en el validador de horarios.
 */
@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final TallerRepository tallerRepository;
    private final HorarioMapper horarioMapper;
    private final HorarioValidator horarioValidator;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo horario para un taller específico.
     *
     * @param dto Datos del horario (día, horas, taller).
     * @return DTO del horario creado.
     */
    @Transactional
    public HorarioResponseDTO crear(HorarioRequestDTO dto) {
        horarioValidator.validarPermisosGestion();
        horarioValidator.validarConsistenciaHoraria(dto);

        Taller taller = buscarTallerInterno(dto.getIdTaller());

        Horario horario = horarioMapper.toEntity(dto);
        horario.setTaller(taller);

        return horarioMapper.toResponse(horarioRepository.save(horario));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todos los horarios registrados.
     *
     * @return Lista de todos los horarios del sistema.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarTodos() {
        return horarioRepository.findAll().stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera los horarios vinculados a un taller específico.
     *
     * @param idTaller Identificador único del taller.
     * @return Lista de horarios asociados al taller.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorTaller(Long idTaller) {
        return horarioRepository.findByTallerId(idTaller).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la agenda semanal personalizada de un usuario.
     *
     * @param idUsuario Identificador del usuario cuya agenda se desea consultar.
     * @return Lista de horarios de los talleres en los que está inscrito.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorUsuario(Long idUsuario) {
        horarioValidator.validarPrivacidadOAdmin(idUsuario);
        return horarioRepository.findHorariosByUsuarioInscrito(idUsuario).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la agenda de clases que un profesor debe impartir.
     * * @param idProfesor Identificador del profesor.
     * 
     * @return Lista de horarios de los talleres que tiene asignados.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorProfesor(Long idProfesor) {
        horarioValidator.validarPrivacidadOAdmin(idProfesor);

        return horarioRepository.findHorariosByProfesorImpartiendo(idProfesor).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }
    // --- MÉTODOS PUT ---

    /**
     * Actualiza un horario existente.
     *
     * @param id  Identificador del horario a modificar.
     * @param dto Nuevos datos.
     * @return DTO del horario actualizado.
     */
    @Transactional
    public HorarioResponseDTO actualizar(Long id, HorarioRequestDTO dto) {
        horarioValidator.validarPermisosGestion();
        horarioValidator.validarConsistenciaHoraria(dto);

        Horario h = buscarHorarioInterno(id);

        h.setDiaSemana(dto.getDiaSemana());
        h.setHoraInicio(dto.getHoraInicio());
        h.setHoraFin(dto.getHoraFin());

        return horarioMapper.toResponse(horarioRepository.save(h));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un horario del sistema de forma definitiva.
     *
     * @param id Identificador del horario a suprimir.
     */
    @Transactional
    public void eliminar(Long id) {
        horarioValidator.validarPermisosGestion();

        if (!horarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el horario no existe");
        }

        horarioRepository.deleteById(id);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Realiza una búsqueda interna de un taller por su identificador único.
     * 
     * @param id Identificador único del taller.
     * @return Entidad Taller recuperada del repositorio.
     * @throws ResourceNotFoundException si el taller no existe en la base de datos.
     */
    private Taller buscarTallerInterno(Long id) {
        return tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un registro de horario por su identificador.
     * 
     * @param id Identificador único del horario.
     * @return Entidad Horario encontrada.
     * @throws ResourceNotFoundException si el horario no existe.
     */
    private Horario buscarHorarioInterno(Long id) {
        return horarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado con ID: " + id));
    }
}