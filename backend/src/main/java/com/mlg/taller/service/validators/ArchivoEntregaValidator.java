package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.ArchivoEntrega;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de archivos físicos de entregas.
 *
 * Implementa controles estrictos de identidad y formato para garantizar que 
 * los archivos adjuntos cumplan con los requisitos de la tarea y la privacidad del alumno.
 */
@Component
@RequiredArgsConstructor
public class ArchivoEntregaValidator {

    /**
     * Verifica que el alumno en sesión sea el propietario de la entrega.
     *
     * @param entrega La entrega a validar.
     * @throws BadRequestException Si el usuario no es el autor de la entrega.
     */
    public void validarPropiedadEntrega(Entrega entrega) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        if (!entrega.getAlumno().getId().equals(solicitante.getId())) {
            throw new BadRequestException("Acceso denegado: Solo el autor de la entrega puede adjuntar archivos.");
        }
    }

    /**
     * Comprueba si el usuario tiene permiso para visualizar los archivos.
     *
     * @param entrega La entrega asociada a los archivos.
     * @throws BadRequestException Si el usuario no es el autor, el profesor titular o administrador.
     */
    public void validarAccesoLectura(Entrega entrega) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAutor = entrega.getAlumno().getId().equals(solicitante.getId());
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null && 
                               entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esSuProfesor && !esAdmin) {
            throw new BadRequestException("No tienes permiso para visualizar los archivos de esta entrega.");
        }
    }

    /**
     * Verifica si el usuario tiene autoridad para eliminar un archivo de entrega.
     *
     * @param archivo El registro del archivo a eliminar.
     * @throws BadRequestException Si el usuario no es el propietario ni administrador.
     */
    public void validarPermisoEliminacion(ArchivoEntrega archivo) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAutor = archivo.getEntrega().getAlumno().getId().equals(solicitante.getId());
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esAdmin) {
            throw new BadRequestException("Solo el alumno propietario o el administrador pueden eliminar archivos.");
        }
    }

    /**
     * Valida que la extensión del archivo esté dentro de la lista blanca de la tarea.
     *
     * @param entrega Entrega que contiene la configuración de la tarea padre.
     * @param extension Extensión del archivo detectada.
     * @throws BadRequestException Si el formato no está permitido.
     */
    public void validarExtensionPermitida(Entrega entrega, String extension) {
        String permitidas = entrega.getTarea().getExtensionesPermitidas();
        if (permitidas != null && !permitidas.isBlank()) {
            if (!permitidas.toLowerCase().contains("." + extension)) {
                throw new BadRequestException("Formato no permitido. La tarea solo acepta: " + permitidas);
            }
        }
    }
}