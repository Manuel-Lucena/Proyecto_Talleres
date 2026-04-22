package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de materiales educativos.
 * * Se encarga de centralizar el blindaje lógico sobre los recursos didácticos,
 * asegurando que el acceso, la publicación y la edición de archivos respeten 
 * la jerarquía de roles y la relación de inscripción de los alumnos.
 */
@Component
@RequiredArgsConstructor
public class MaterialValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Valida si un usuario tiene autoridad para gestionar (crear, editar o eliminar) 
     * materiales en un taller específico.
     * * @param solicitante Usuario que intenta realizar la acción.
     * @param taller      Taller sobre el que se pretende actuar.
     * @throws BadRequestException Si el usuario no es ADMINISTRADOR ni el profesor titular del taller.
     */
    public void validarPermisosGestion(Usuario solicitante, Taller taller) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = taller.getProfesor() != null && 
                             taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("Operación denegada: No tienes privilegios de gestión sobre los materiales de este taller.");
        }
    }

    /**
     * Valida el acceso de lectura a un recurso material individual.
     * * Implementa las siguientes restricciones:
     * 1. El ADMIN tiene acceso total.
     * 2. El ALUMNO debe estar inscrito en el taller y el material debe estar marcado como visible.
     * 3. El PROFESOR solo puede ver materiales de sus propios talleres.
     * * @param solicitante Usuario que solicita el recurso.
     * @param material    Entidad del material solicitado.
     * @throws BadRequestException Si no se cumplen las condiciones de visibilidad o inscripción.
     */
    public void validarAccesoLectura(Usuario solicitante, Material material) {
        String rol = solicitante.getRol().getNombre().toUpperCase();
        boolean esAdmin = rol.equals("ADMIN");

        if (esAdmin) return;

        if (rol.equals("ALUMNO")) {
            boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                    solicitante.getId(), material.getTaller().getId());
            
            if (!estaInscrito || !material.isVisible()) {
                throw new BadRequestException("Acceso denegado: El recurso no está disponible para tu perfil o no estás inscrito en el taller.");
            }
        } else if (rol.equals("PROFESOR")) {
            if (!material.getTaller().getProfesor().getId().equals(solicitante.getId())) {
                throw new BadRequestException("Acceso denegado: No puedes visualizar materiales de talleres que no impartes.");
            }
        }
    }

    /**
     * Verifica si un alumno posee una matrícula vigente para listar los materiales de un taller.
     * * @param solicitante Usuario que realiza la consulta.
     * @param idTaller    Identificador del taller a consultar.
     * @throws BadRequestException Si el alumno no tiene una inscripción activa.
     */
    public void validarInscripcion(Usuario solicitante, Long idTaller) {
        if (solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")) return;

        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                solicitante.getId(), idTaller);
        
        if (!estaInscrito) {
            throw new BadRequestException("Consulta denegada: Debes tener una inscripción activa para acceder a los materiales de este taller.");
        }
    }
}