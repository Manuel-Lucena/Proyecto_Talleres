package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente especializado en la validación de reglas de negocio y seguridad para Tareas.
 * Centraliza el blindaje para asegurar que solo profesores dueños o admins gestionen tareas.
 */
@Component
@RequiredArgsConstructor
public class TareaValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Valida si el usuario tiene permiso para gestionar tareas de un taller (Crear/Listar).
     * @param solicitante Usuario que realiza la acción.
     * @param taller Taller donde se quiere actuar.
     */
    public void validarGestionTaller(Usuario solicitante, Taller taller) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No tienes permiso para gestionar tareas en este taller.");
        }
    }

    /**
     * Valida si un usuario tiene permiso para modificar o eliminar una tarea existente.
     * @param solicitante Usuario que realiza la acción.
     * @param tarea Tarea a modificar.
     */
    public void validarPropiedadTarea(Usuario solicitante, Tarea tarea) {
        validarGestionTaller(solicitante, tarea.getTaller());
    }

    /**
     * Verifica si un alumno tiene acceso a las tareas de un taller mediante inscripción activa.
     * @param idAlumno ID del alumno.
     * @param idTaller ID del taller.
     */
    public void validarAccesoAlumno(Long idAlumno, Long idTaller) {
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(idAlumno, idTaller);
        if (!estaInscrito) {
            throw new BadRequestException("Acceso denegado: No estás inscrito activamente en este taller.");
        }
    }

    /**
     * Valida el acceso a una tarea específica según el rol.
     * @param solicitante Usuario que intenta acceder.
     * @param tarea Tarea solicitada.
     */
    public void validarAccesoTarea(Usuario solicitante, Tarea tarea) {
        String rol = solicitante.getRol().getNombre();

        if (rol.equalsIgnoreCase("ALUMNO")) {
            validarAccesoAlumno(solicitante.getId(), tarea.getTaller().getId());
            if (!tarea.isVisible()) {
                throw new BadRequestException("La tarea aún no está disponible.");
            }
        } else if (rol.equalsIgnoreCase("PROFESOR")) {
            validarGestionTaller(solicitante, tarea.getTaller());
        }
    }

    /**
     * Valida que el usuario sea administrador para listados globales.
     * @param solicitante Usuario a validar.
     */
    public void validarEsAdmin(Usuario solicitante) {
        if (!solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Solo los administradores pueden realizar esta acción.");
        }
    }
}