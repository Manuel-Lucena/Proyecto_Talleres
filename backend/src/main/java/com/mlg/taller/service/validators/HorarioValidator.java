package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la planificación horaria de los talleres.
 * * Se encarga de verificar la integridad de las franjas horarias y de
 * asegurar que solo el personal autorizado realice cambios en la agenda.
 */
@Component
@RequiredArgsConstructor
public class HorarioValidator {

    /**
     * Verifica que el usuario en sesión tenga el rol de ADMINISTRADOR.
     * * @throws BadRequestException Si el usuario no tiene privilegios administrativos.
     */
    public void validarPermisosGestion() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Acceso denegado: Solo el administrador puede modificar la planificación horaria.");
        }
    }

    /**
     * Valida que un usuario tenga permiso para ver una agenda específica.
     * * Permite el acceso si el solicitante es el dueño de la agenda o un administrador.
     * * @param idUsuarioDestino ID del usuario cuya agenda se consulta.
     * @throws BadRequestException Si se intenta acceder a datos ajenos sin permiso.
     */
    public void validarPrivacidadOAdmin(Long idUsuarioDestino) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin && !solicitante.getId().equals(idUsuarioDestino)) {
            throw new BadRequestException("Acceso denegado: No tienes permiso para visualizar agendas de otros usuarios.");
        }
    }

    /**
     * Comprueba que las horas de una petición sean lógicamente consistentes.
     * * @param dto Datos del horario a validar.
     * @throws BadRequestException Si la hora de inicio es posterior o igual a la de fin.
     */
    public void validarConsistenciaHoraria(HorarioRequestDTO dto) {
        if (dto.getHoraInicio() == null || dto.getHoraFin() == null) {
            throw new BadRequestException("Error: Las horas de inicio y fin son obligatorias.");
        }

        if (dto.getHoraInicio().isAfter(dto.getHoraFin()) || dto.getHoraInicio().equals(dto.getHoraFin())) {
            throw new BadRequestException("Inconsistencia horaria: la hora de inicio debe ser anterior a la de fin.");
        }
    }
}