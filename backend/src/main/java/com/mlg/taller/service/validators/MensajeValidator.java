package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Mensaje;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente de validación encargado de proteger la integridad y privacidad
 * de la comunicación en los foros de los talleres.
 * * Implementa las reglas de negocio que restringen el envío y borrado de mensajes
 * basándose en la relación del usuario con el taller (profesor, alumno o admin).
 */
@Component
@RequiredArgsConstructor
public class MensajeValidator {

    private final InscripcionRepository inscripcionRepository;

    /**
     * Valida si un usuario tiene autorización para participar en la comunicación de un taller.
     * El acceso se permite si el usuario es ADMINISTRADOR, el profesor titular del taller
     * o un alumno con una inscripción activa en el mismo.
     * * @param usuario Usuario que intenta acceder o enviar un mensaje.
     * @param taller  Taller al que pertenece el foro de mensajería.
     * @throws BadRequestException Si el usuario no cumple ninguno de los criterios de acceso.
     */
    public void validarAccesoATaller(Usuario usuario, Taller taller) {
        boolean esAdmin = usuario.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esProfeDelTaller = taller.getProfesor() != null 
                && taller.getProfesor().getId().equals(usuario.getId());
        
        // Verificamos si el alumno tiene una inscripción activa en la tabla de inscripciones
        boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                usuario.getId(), taller.getId());

        if (!esAdmin && !esProfeDelTaller && !estaInscrito) {
            throw new BadRequestException("Acceso denegado: No tienes permisos para participar en la comunicación de este taller.");
        }
    }

    /**
     * Valida si el usuario solicitante posee la autoridad necesaria para eliminar un mensaje.
     * La eliminación es permitida para:
     * 1. El ADMINISTRADOR del sistema.
     * 2. El autor original del mensaje.
     * 3. El profesor titular del taller (rol de moderador).
     * * @param solicitante Usuario que intenta realizar la eliminación.
     * @param mensaje     Entidad del mensaje que se pretende borrar.
     * @throws BadRequestException Si el usuario no tiene privilegios de autoría o moderación.
     */
    public void validarPermisoBorrado(Usuario solicitante, Mensaje mensaje) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esAutor = mensaje.getAutor().getId().equals(solicitante.getId());
        boolean esProfeDelTaller = mensaje.getTaller().getProfesor() != null 
                && mensaje.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esAutor && !esProfeDelTaller) {
            throw new BadRequestException("Operación denegada: No tienes permiso para eliminar este mensaje.");
        }
    }

    /**
     * Verifica que el usuario posea el rol de ADMINISTRADOR para acciones globales.
     * * @param usuario Usuario autenticado en la sesión.
     * @throws BadRequestException Si el rol del usuario no es estrictamente ADMINISTRADOR.
     */
    public void validarEsAdmin(Usuario usuario) {
        if (!usuario.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Acceso restringido: Esta operación solo puede ser realizada por un administrador.");
        }
    }
}