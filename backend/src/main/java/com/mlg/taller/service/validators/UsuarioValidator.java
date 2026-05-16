package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.DuplicateResourceException;
import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.repositories.TallerRepository; 
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente especializado en la validación de reglas de negocio y seguridad
 * para Usuarios.
 * Centraliza el blindaje para asegurar que no existan duplicados de datos
 * sensibles
 * y que los permisos de edición se cumplan estrictamente.
 */
@Component
@RequiredArgsConstructor
public class UsuarioValidator {

    private final UsuarioRepository usuarioRepository;
    private final TallerRepository tallerRepository; 

    /**
     * Verifica si un email ya está registrado en el sistema.
     * 
     * @param email Correo a validar.
     */
    public void validarEmailUnico(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("El email " + email + " ya está registrado");
        }
    }

    /**
     * Verifica si un DNI ya está registrado en el sistema.
     * 
     * @param dni DNI a validar.
     */
    public void validarDniUnico(String dni) {
        if (usuarioRepository.existsByDni(dni)) {
            throw new DuplicateResourceException("El DNI " + dni + " ya está registrado");
        }
    }

    /**
     * Valida la disponibilidad de Email y DNI durante una actualización.
     * Solo dispara la validación si el dato ha cambiado respecto al original.
     * 
     * @param dto       Nuevos datos.
     * @param existente Usuario actual.
     */
    public void validarCambioDatosUnicos(UsuarioRequestDTO dto, Usuario existente) {
        if (dto.getEmail() != null && !existente.getEmail().equalsIgnoreCase(dto.getEmail())) {
            validarEmailUnico(dto.getEmail());
        }
        if (dto.getDni() != null && !existente.getDni().equalsIgnoreCase(dto.getDni())) {
            validarDniUnico(dto.getDni());
        }
    }

    /**
     * Verifica si un usuario puede ser desactivado según su rol y
     * responsabilidades.
     * Impide la desactivación de profesores que tienen talleres asignados para
     * mantener
     * la integridad referencial lógica del sistema.
     * * @param objetivo Usuario que se intenta modificar.
     * 
     * @param dto Datos recibidos en la petición de actualización.
     * @throws BadRequestException Si se intenta desactivar un profesor con talleres
     *                             activos.
     */
    public void validarEstadoDesactivacion(Usuario objetivo, UsuarioRequestDTO dto) {
        if (objetivo.isActivo() && dto.getActivo() != null && !dto.getActivo()) {

            String nombreRol = objetivo.getRol().getNombre().toUpperCase();

           
            if (nombreRol.equals("PROFESOR") && tallerRepository.existsByProfesorId(objetivo.getId())) {
                throw new BadRequestException("No se puede desactivar al docente porque tiene talleres asignados.");
            }


            if (nombreRol.equals("ALUMNO")) {
                Integer activas = usuarioRepository.tieneInscripcionesActivas(objetivo.getId());
                if (activas != null && activas > 0) {
                    throw new BadRequestException("No se puede desactivar al alumno '" + objetivo.getNombre() +
                            "' porque tiene " + activas + " inscripciones activas.");
                }
            }
        }
    }

    /**
     * Valida si el usuario tiene permiso para modificar un perfil.
     * 
     * @param solicitante Usuario que realiza la acción.
     * @param objetivo    Usuario que va a ser modificado.
     * @param dto         Datos de la petición para verificar cambios de rol.
     */
    public void validarPermisosActualizacion(Usuario solicitante, Usuario objetivo, UsuarioRequestDTO dto) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        if (!esAdmin && !solicitante.getId().equals(objetivo.getId())) {
            throw new BadRequestException("No tienes permisos para modificar el perfil de otros usuarios.");
        }
        if (!esAdmin && dto.getIdRol() != null && !objetivo.getRol().getId().equals(dto.getIdRol())) {
            throw new BadRequestException("No tienes permiso para cambiar tu nivel de privilegios.");
        }
    }
}