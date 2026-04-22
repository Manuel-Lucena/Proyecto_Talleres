package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de asignaciones de tareas.
 * Asegura que solo el personal autorizado gestione la visibilidad y que los alumnos
 * asignados pertenezcan realmente al taller.
 */
@Component
@RequiredArgsConstructor
public class TareaAsignadaValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Verifica si el usuario actual tiene autoridad sobre la tarea (Admin o Profesor titular).
     * @param solicitante Usuario que intenta realizar la acción.
     * @param tarea Tarea sobre la que se quiere actuar.
     */
    public void validarAccesoProfesor(Usuario solicitante, Tarea tarea) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = tarea.getTaller().getProfesor() != null 
                && tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No eres el profesor titular de este taller.");
        }
    }

    /**
     * Valida que un alumno específico pueda ser asignado a una tarea de un taller concreto.
     * @param alumnoId ID del alumno.
     * @param tallerId ID del taller.
     * @throws BadRequestException Si el alumno no tiene una inscripción activa en el taller.
     */
    public void validarAlumnoInscrito(Long alumnoId, Long tallerId) {
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(alumnoId, tallerId);
        if (!estaInscrito) {
            throw new BadRequestException("El alumno con ID " + alumnoId + " no está inscrito activamente en este taller.");
        }
    }
}