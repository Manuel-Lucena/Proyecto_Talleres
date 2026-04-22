package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.enums.EstadoPago;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de archivos adjuntos a tareas.
 *
 * Centraliza las reglas de seguridad para asegurar que solo el personal 
 * autorizado gestione archivos y solo los alumnos con pagos confirmados 
 * puedan acceder a los recursos educativos.
 */
@Component
@RequiredArgsConstructor
public class ArchivoTareaValidator {

    /**
     * Verifica permisos de gestión para acciones de escritura o borrado.
     *
     * @param tarea Tarea sobre la cual se pretende actuar.
     * @throws BadRequestException si el usuario no es ADMIN ni el profesor titular.
     */
    public void validarPropiedadTarea(Tarea tarea) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = tarea.getTaller().getProfesor() != null && 
                               tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No tienes permisos para gestionar recursos de esta tarea.");
        }
    }

    /**
     * Verifica permisos de lectura basándose en el rol y estado de pago.
     *
     * @param tarea Tarea cuyos archivos se desean consultar.
     * @throws BadRequestException si el alumno no ha pagado o el profesor no es el titular.
     */
    public void validarAccesoLectura(Tarea tarea) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        String rol = solicitante.getRol().getNombre();

        if (rol.equalsIgnoreCase("ADMIN")) return;

        if (rol.equalsIgnoreCase("PROFESOR")) {
            if (tarea.getTaller().getProfesor() != null && 
                tarea.getTaller().getProfesor().getId().equals(solicitante.getId())) {
                return;
            }
            throw new BadRequestException("Acceso denegado: No eres el profesor responsable de este taller.");
        }

    
        boolean estaInscritoYPaga = tarea.getTaller().getInscripciones().stream()
                .anyMatch(ins -> ins.getUsuario().getId().equals(solicitante.getId()) && 
                                 ins.getEstadoPago().equals(EstadoPago.PAGADO));

        if (!estaInscritoYPaga) {
            throw new BadRequestException("Acceso denegado: Debes estar inscrito y haber pagado el taller para ver estos recursos.");
        }
    }
}