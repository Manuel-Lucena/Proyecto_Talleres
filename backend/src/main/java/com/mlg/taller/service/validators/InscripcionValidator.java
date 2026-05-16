package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Horario;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

/**
 * Componente de validación para el proceso de inscripciones.
 *
 * Centraliza las reglas de negocio y los controles de seguridad relacionados
 * con las matriculaciones, asegurando que los usuarios solo accedan o
 * modifiquen la información para la que están autorizados.
 */
@Component
@RequiredArgsConstructor
public class InscripcionValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Verifica que el destinatario de la inscripción posea el rol de ALUMNO.
     *
     * Impide que usuarios con rol ADMIN o PROFESOR sean registrados en la tabla
     * de inscripciones, ya que su vinculación con los talleres se gestiona por
     * privilegios de acceso o asignación docente directa.
     *
     * @param usuario Entidad del usuario que se pretende inscribir.
     * @throws BadRequestException si el rol no es ALUMNO.
     */
    public void validarPerfilInscribible(Usuario usuario) {
        if (!usuario.getRol().getNombre().equalsIgnoreCase("ALUMNO")) {
            throw new BadRequestException("Restricción de rol: El usuario " + usuario.getEmail() +
                    " tiene perfil de " + usuario.getRol().getNombre() +
                    " y no puede ser registrado como alumno matriculado.");
        }
    }

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
        boolean esSuProfesor = inscripcion.getTaller().getProfesor() != null
                && inscripcion.getTaller().getProfesor().getId().equals(solicitante.getId());
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
        if (!solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")
                && !inscripcion.getUsuario().getId().equals(solicitante.getId())) {
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
        boolean esSuProfesor = taller.getProfesor() != null && taller.getProfesor().getId().equals(solicitante.getId());
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
     * @param email     Email del alumno
     * @throws BadRequestException si ya existe un registro (activo o inactivo).
     */
    public void verificarDuplicado(Long idUsuario, Long idTaller, String email) {
        if (inscripcionRepository.findByUsuarioIdAndTallerId(idUsuario, idTaller).isPresent()) {
            throw new BadRequestException(
                    "El alumno con email " + email + " ya cuenta con una inscripción (activa o inactiva).");
        }
    }

    /**
     * Compara los horarios de un taller nuevo frente a los de un taller ya
     * inscrito.
     *
     * Al ser una relación de uno a muchos, se verifica si cualquier sesión del
     * taller nuevo choca con cualquier sesión del taller inscrito.
     *
     * @param nuevo    Taller al que se desea inscribir.
     * @param inscrito Taller en el que ya participa el usuario.
     * @return true si existe al menos un conflicto horario, false en caso
     *         contrario.
     */
    public boolean verificarSolapamiento(Taller nuevo, Taller inscrito) {
        if (nuevo.getHorarios() == null || inscrito.getHorarios() == null) {
            return false;
        }
        for (Horario hNuevo : nuevo.getHorarios()) {
            for (Horario hInscrito : inscrito.getHorarios()) {
                if (hNuevo.getDiaSemana().equalsIgnoreCase(hInscrito.getDiaSemana())) {
                    boolean cruce = hNuevo.getHoraInicio().isBefore(hInscrito.getHoraFin())
                            && hNuevo.getHoraFin().isAfter(hInscrito.getHoraInicio());
                    if (cruce)
                        return true;
                }
            }
        }
        return false;
    }

    /**
     * Recupera una inscripción previa para la combinación usuario/taller.
     * * Permite detectar si existe un registro histórico (activo o inactivo) para
     * decidir si se debe realizar una nueva inserción o una reactivación.
     * * @param idUsuario ID del alumno.
     * 
     * @param idTaller ID del taller.
     * @return Entidad Inscripcion si existe, null en caso contrario.
     */
    public Inscripcion buscarRegistroPrevio(Long idUsuario, Long idTaller) {
        return inscripcionRepository.findByUsuarioIdAndTallerId(idUsuario, idTaller).orElse(null);
    }

    /**
     * Valida si el taller se encuentra dentro de las fechas permitidas para la
     * inscripción.
     * * Un usuario estándar solo puede inscribirse si la fecha actual es anterior
     * o igual a la fecha de fin del taller. El ADMINISTRADOR ignora esta
     * restricción
     * para permitir gestiones extemporáneas o correcciones manuales.
     * * @param solicitante Usuario que realiza la petición.
     * 
     * @param taller Taller al que se desea inscribir.
     * @throws BadRequestException si el taller ya ha finalizado y el solicitante no
     *                             es ADMIN.
     */
    public void validarFechaInscripcion(Usuario solicitante, Taller taller) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        LocalDateTime ahora = LocalDateTime.now();

        if (!esAdmin && ahora.isAfter(taller.getFechaFin().atTime(23, 59, 59))) {
            throw new BadRequestException("El periodo de inscripción para el taller '" +
                    taller.getNombre() + "' ha finalizado.");
        }
    }

    /**
     * Valida si el usuario tiene permisos para consultar el panel de notas globales
     * del taller.
     * * Restringe el acceso exclusivamente al ADMINISTRADOR y al PROFESOR que
     * imparte
     * el taller.
     * * @param solicitante Usuario que intenta acceder a la información.
     * 
     * @param taller Taller del cual se pretenden obtener las notas.
     * @throws BadRequestException si el usuario no tiene privilegios de gestión
     *                             sobre el taller.
     */
    public void validarAccesoNotasGlobales(Usuario solicitante, Taller taller) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = taller.getProfesor() != null &&
                taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException(
                    "Acceso denegado: Solo el profesor del taller o el administrador pueden ver las notas globales.");
        }
    }

    /**
     * Valida si el taller dispone de vacantes libres para procesar una nueva
     * matriculación.
     * * Realiza un conteo en tiempo real de las inscripciones activas y lo
     * contrasta con el límite de plazas máximas definido en la entidad Taller. Este control
     * garantiza la integridad del aforo y evita la sobreventa de plazas.
     * * @param taller Entidad del taller sobre el que se desea realizar la
     * comprobación.
     * 
     * @throws BadRequestException si el número de inscritos es igual o superior
     *                             al cupo de plazas máximas permitido.
     */
    public void validarCupoDisponible(Taller taller) {
        long inscritos = inscripcionRepository.countByTallerIdAndActivaTrue(taller.getId());
        if (inscritos >= taller.getPlazasMaximas()) {
            throw new BadRequestException("El taller '" + taller.getNombre() + "' ya ha alcanzado su cupo máximo.");
        }
    }
}