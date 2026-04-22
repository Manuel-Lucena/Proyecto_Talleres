package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación para el proceso de inscripciones.
 * 
 * Centraliza las reglas de negocio y los controles de seguridad relacionados
 * con las matriculaciones, asegurando que los usuarios solo accedan o
 * modifiquen
 * la información para la que están autorizados.
 */
@Component
@RequiredArgsConstructor
public class InscripcionValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Valida si el usuario autenticado tiene permiso para realizar una acción
     * sobre un perfil de usuario destino.
     * 
     * Permite la operación si el solicitante es ADMINISTRADOR o si es el propio
     * dueño de la cuenta.
     *
     * @param solicitante      Usuario que realiza la petición.
     * @param idUsuarioDestino ID del usuario sobre el que se quiere actuar.
     * @throws BadRequestException si no se cumplen los criterios de propiedad.
     */
    public void validarPropiedadOSolicitante(Usuario solicitante, Long idUsuarioDestino) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        if (!esAdmin && !solicitante.getId().equals(idUsuarioDestino)) {
            throw new BadRequestException("Operación denegada: No puedes gestionar inscripciones de otros usuarios.");
        }
    }

    /**
     * Valida el acceso a los detalles de una inscripción específica.
     * 
     * Tienen acceso: Administradores, el alumno titular de la inscripción y
     * el profesor que imparte el taller asociado.
     *
     * @param solicitante Usuario que intenta acceder.
     * @param inscripcion Entidad de la inscripción a consultar.
     * @throws BadRequestException si el usuario no tiene relación con la
     *                             inscripción.
     */
    public void validarAccesoInscripcion(Usuario solicitante, Inscripcion inscripcion) {
        String rol = solicitante.getRol().getNombre().toUpperCase();
        boolean esAdmin = rol.equals("ADMIN");
        boolean esSuInscripcion = inscripcion.getUsuario().getId().equals(solicitante.getId());
        boolean esSuProfesor = inscripcion.getTaller().getProfesor() != null &&
                inscripcion.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuInscripcion && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No tienes permisos sobre esta inscripción.");
        }
    }

    /**
     * Restringe la descarga de facturas y comprobantes de pago.
     * 
     * Solo el administrador o el usuario que realizó el pago pueden descargar el
     * PDF.
     *
     * @param solicitante Usuario que solicita el documento.
     * @param inscripcion Inscripción vinculada a la factura.
     * @throws BadRequestException si el solicitante no es el titular ni admin.
     */
    public void validarAccesoFactura(Usuario solicitante, Inscripcion inscripcion) {
        if (!solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN") &&
                !inscripcion.getUsuario().getId().equals(solicitante.getId())) {
            throw new BadRequestException("Acceso denegado: Solo el titular puede descargar esta factura.");
        }
    }

    /**
     * Valida si un usuario puede consultar el listado de alumnos de un taller.
     * 
     * Se permite el acceso a Administradores y al profesor asignado al taller.
     *
     * @param solicitante Usuario que realiza la consulta.
     * @param taller      Taller del cual se desea ver la lista de clase.
     * @throws BadRequestException si un profesor intenta ver un taller que no
     *                             imparte.
     */
    public void validarAccesoListaTaller(Usuario solicitante, Taller taller) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = taller.getProfesor() != null &&
                taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No puedes ver la lista de alumnos de un taller ajeno.");
        }
    }

    /**
     * Verifica que no exista una inscripción previa para la combinación
     * usuario/taller.
     * 
     * Este control evita duplicidad de cobros y registros para un mismo curso.
     *
     * @param idUsuario ID del alumno.
     * @param idTaller  ID del taller.
     * @throws BadRequestException si ya existe un registro (activo o inactivo).
     */
    public void verificarDuplicado(Long idUsuario, Long idTaller) {
        if (inscripcionRepository.existsByUsuarioIdAndTallerId(idUsuario, idTaller)) {
            throw new BadRequestException(
                    "El usuario ya cuenta con una inscripción (activa o inactiva) en este taller.");
        }
    }
}