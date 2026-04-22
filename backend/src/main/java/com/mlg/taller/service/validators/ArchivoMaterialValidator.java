package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.enums.EstadoPago;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para la gestión de archivos adjuntos a materiales.
 *
 * Centraliza las reglas de seguridad para asegurar que solo los creadores del contenido
 * o administradores gestionen los recursos y que los alumnos cumplan con los requisitos de acceso.
 */
@Component
@RequiredArgsConstructor
public class ArchivoMaterialValidator {

    /**
     * Valida que el usuario tenga permisos de gestión (Escritura/Borrado).
     *
     * Requiere que el solicitante sea ADMINISTRADOR o el profesor titular del taller.
     *
     * @param material El material sobre el que se desea operar.
     * @throws BadRequestException Si el usuario no tiene permisos de gestión.
     */
    public void validarPropiedadMaterial(Material material) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = material.getTaller().getProfesor() != null && 
                               material.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No eres el profesor responsable de este material.");
        }
    }

    /**
     * Verifica los permisos de lectura para acceder a los archivos del material.
     *
     * Considera el rol del usuario, la visibilidad del material y el estado 
     * de inscripción/pago para los alumnos.
     *
     * @param material El material al que se intenta acceder.
     * @throws BadRequestException Si el material está oculto o el alumno no cumple los requisitos.
     */
    public void validarAccesoLectura(Material material) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        String rol = solicitante.getRol().getNombre();
        
        boolean esAdmin = rol.equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = material.getTaller().getProfesor() != null && 
                               material.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (esAdmin || esSuProfesor) return;

        if (!material.isVisible()) {
            throw new BadRequestException("Este material aún no está disponible para los alumnos.");
        }

        boolean estaInscritoYPaga = material.getTaller().getInscripciones().stream()
                .anyMatch(ins -> ins.getUsuario().getId().equals(solicitante.getId()) && 
                                 ins.getEstadoPago().equals(EstadoPago.PAGADO));

        if (!estaInscritoYPaga) {
            throw new BadRequestException("Acceso denegado: Debes estar inscrito y haber pagado el taller para ver sus materiales.");
        }
    }
}