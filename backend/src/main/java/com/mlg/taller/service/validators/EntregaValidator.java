package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.DuplicateResourceException;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de entregas y calificaciones.
 *
 * Asegura el cumplimiento de los plazos, la privacidad de los trabajos entre alumnos
 * y la integridad de las evaluaciones realizadas por los profesores.
 */
@Component
@RequiredArgsConstructor
public class EntregaValidator {

    private final EntregaRepository entregaRepository;
    private final InscripcionRepository inscripcionRepository;

    /**
     * Valida si un alumno cumple los requisitos para enviar una tarea.
     *
     * Verifica que la tarea esté publicada, que el alumno tenga una inscripción 
     * activa en el taller y que no haya enviado un trabajo previamente.
     *
     * @param alumno Usuario que realiza la entrega.
     * @param tarea Tarea a la que se asocia el trabajo.
     * @throws BadRequestException si la tarea está oculta o no hay inscripción activa.
     * @throws DuplicateResourceException si ya existe una entrega previa.
     */
    public void validarRequisitosEnvio(Usuario alumno, Tarea tarea) {
        if (!tarea.isVisible()) {
            throw new BadRequestException("No puedes entregar trabajos para una tarea que aún no ha sido publicada.");
        }

        boolean inscripcionActiva = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                alumno.getId(), tarea.getTaller().getId());

        if (!inscripcionActiva) {
            throw new BadRequestException("No tienes una inscripción activa en el taller correspondiente.");
        }

        entregaRepository.findByTareaIdAndAlumnoId(tarea.getId(), alumno.getId())
                .ifPresent(e -> {
                    throw new DuplicateResourceException("Ya existe una entrega registrada para ti en esta tarea.");
                });
    }

    /**
     * Valida el acceso a la lectura de una entrega específica.
     *
     * Permite el acceso a Administradores, al autor de la entrega y al profesor
     * titular del taller correspondiente.
     *
     * @param solicitante Usuario que intenta acceder.
     * @param entrega Entidad de la entrega a consultar.
     * @throws BadRequestException si el usuario no tiene permisos de visualización.
     */
    public void validarAccesoLectura(Usuario solicitante, Entrega entrega) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esElDueno = entrega.getAlumno().getId().equals(solicitante.getId());
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null && 
                               entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esElDueno && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No tienes permiso para visualizar esta entrega.");
        }
    }

    /**
     * Valida si el usuario tiene permisos de gestión sobre una tarea.
     *
     * Se requiere rol de Administrador o ser el profesor asignado al taller.
     *
     * @param solicitante Usuario que realiza la acción.
     * @param tarea Tarea asociada al recurso.
     * @throws BadRequestException si el usuario no es gestor ni profesor titular.
     */
    public void validarPermisosGestion(Usuario solicitante, Tarea tarea) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = tarea.getTaller().getProfesor() != null && 
                               tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No tienes permisos de gestión sobre este recurso.");
        }
    }

    /**
     * Valida si una entrega puede ser modificada por el alumno.
     *
     * Solo permite la edición si el usuario es el autor y la entrega aún 
     * no ha sido calificada por un profesor.
     *
     * @param solicitante Usuario que intenta editar.
     * @param entrega Entrega original.
     * @throws BadRequestException si no es el dueño o si ya posee una calificación.
     */
    public void validarEdicionEntrega(Usuario solicitante, Entrega entrega) {
        if (!entrega.getAlumno().getId().equals(solicitante.getId())) {
            throw new BadRequestException("Acceso denegado: No puedes editar el trabajo de otro alumno.");
        }

        if (entrega.getCalificacion() != null) {
            throw new BadRequestException("Integridad protegida: No se puede editar una entrega que ya ha sido calificada.");
        }
    }
}