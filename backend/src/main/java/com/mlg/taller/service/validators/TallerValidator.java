package com.mlg.taller.service.validators;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Componente de validación especializado para la entidad Taller.
 * * Se encarga de centralizar el blindaje de seguridad y la integridad de los datos,
 * asegurando que las reglas de negocio se cumplan antes de cualquier persistencia.
 */
@Component
@RequiredArgsConstructor
public class TallerValidator {

    /**
     * Valida si el usuario solicitante tiene permisos para acceder a información sensible.
     * * @param solicitante Usuario que realiza la petición.
     * @param idObjetivo  ID del usuario cuyos datos se pretenden consultar.
     * @throws BadRequestException Si el usuario no es ADMIN y no es el propio dueño de los datos.
     */
    public void validarAccesoPrivado(Usuario solicitante, Long idObjetivo) {
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        
        if (!esAdmin && !solicitante.getId().equals(idObjetivo)) {
            throw new BadRequestException("Acceso denegado: No tienes permisos para consultar datos de otros usuarios.");
        }
    }

    /**
     * Garantiza que una operación de escritura o modificación sea realizada exclusivamente
     * por un perfil con autoridad máxima.
     * * @param solicitante Usuario autenticado en la sesión.
     * @throws BadRequestException Si el usuario no posee el rol de ADMINISTRADOR.
     */
    public void validarEsAdmin(Usuario solicitante) {
        if (!solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Operación denegada: Se requieren privilegios de administrador para gestionar talleres.");
        }
    }

    /**
     * Realiza una validación lógica de la línea temporal del taller.
     * * @param inicio Fecha de comienzo del taller.
     * @param fin    Fecha de conclusión del taller.
     * @throws BadRequestException Si la fecha de fin es cronológicamente anterior a la de inicio.
     */
    public void validarFechas(LocalDate inicio, LocalDate fin) {
        if (inicio != null && fin != null && fin.isBefore(inicio)) {
            throw new BadRequestException("Error de coherencia: La fecha de finalización no puede ser anterior a la de inicio.");
        }
    }
}