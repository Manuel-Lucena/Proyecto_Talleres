package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.HorarioMapper;
import com.mlg.taller.repositories.HorarioRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de los horarios asociados a los talleres.
 * Centraliza la planificación temporal de las actividades, restringiendo la
 * modificación de turnos exclusivamente al personal de administración.
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
     * Solo accesible por administradores.
     *
     * @param dto Datos del horario (día, horas, taller).
     * @return HorarioResponseDTO del registro creado.
     * @throws ResourceNotFoundException Si el taller referenciado no existe.
     * @throws BadRequestException       Si el usuario no es administrador o la hora de inicio es posterior a la de fin.
     */
    @Transactional
    public HorarioResponseDTO crear(HorarioRequestDTO dto) {
        validarAdmin();
        validarConsistenciaHoraria(dto);

        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("No se puede crear el horario: Taller no encontrado"));

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
     * Solo accesible por el propio usuario o por un administrador.
     *
     * @param idUsuario Identificador del usuario cuya agenda se desea consultar.
     * @return Lista de horarios de los talleres en los que está inscrito.
     * @throws BadRequestException Si un usuario intenta consultar una agenda ajena sin ser administrador.
     */
    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorUsuario(Long idUsuario) {
        validarPrivacidadOAdmin(idUsuario);
        return horarioRepository.findHorariosByUsuarioInscrito(idUsuario).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza un horario existente.
     * Solo accesible por administradores.
     *
     * @param id  Identificador del horario a modificar.
     * @param dto Nuevos datos (día, franja horaria).
     * @return HorarioResponseDTO actualizado.
     * @throws ResourceNotFoundException Si el horario no existe.
     * @throws BadRequestException       Si el usuario no es administrador o las horas son inconsistentes.
     */
    @Transactional
    public HorarioResponseDTO actualizar(Long id, HorarioRequestDTO dto) {
        validarAdmin();
        validarConsistenciaHoraria(dto);

        Horario h = horarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado con ID: " + id));

        h.setDiaSemana(dto.getDiaSemana());
        h.setHoraInicio(dto.getHoraInicio());
        h.setHoraFin(dto.getHoraFin());
        return horarioMapper.toResponse(horarioRepository.save(h));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un horario del sistema de forma definitiva.
     * Solo accesible por administradores.
     *
     * @param id Identificador del horario a suprimir.
     * @throws ResourceNotFoundException Si el horario no existe.
     * @throws BadRequestException       Si el usuario no es administrador.
     */
    @Transactional
    public void eliminar(Long id) {
        validarAdmin();
        if (!horarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el horario no existe");
        }
        horarioRepository.deleteById(id);
    }

    // --- MÉTODOS PRIVADOS DE SEGURIDAD ---

    /**
     * Verifica que el usuario en sesión tenga el rol de ADMINISTRADOR.
     */
    private void validarAdmin() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Acceso denegado: Solo el administrador puede modificar la planificación horaria.");
        }
    }

    /**
     * Garantiza que un alumno solo pueda acceder a su propia agenda de talleres.
     */
    private void validarPrivacidadOAdmin(Long idUsuario) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin && !solicitante.getId().equals(idUsuario)) {
            throw new BadRequestException("Acceso denegado: No tienes permiso para visualizar agendas de otros usuarios.");
        }
    }

    /**
     * Valida que la franja horaria definida sea lógicamente correcta.
     */
    private void validarConsistenciaHoraria(HorarioRequestDTO dto) {
        if (dto.getHoraInicio().isAfter(dto.getHoraFin())) {
            throw new BadRequestException("Inconsistencia horaria: la hora de inicio no puede ser posterior a la de fin.");
        }
    }
}