package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.InscripcionMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de inscripciones de usuarios en talleres.
 */
@Service
@RequiredArgsConstructor
public class InscripcionService {

        private final InscripcionRepository inscripcionRepository;
        private final TallerRepository tallerRepository;
        private final UsuarioRepository usuarioRepository;
        private final InscripcionMapper inscripcionMapper;
        private final EmailService emailService;
        private final PdfService pdfService;

        // --- MÉTODOS POST ---

        /**
         * Registra una nueva inscripción, genera la factura en PDF y la envía por
         * email.
         * * @param dto Datos de la inscripción (Usuario, Taller, Pago).
         * 
         * @return DTO con la información de la inscripción realizada.
         * @throws ResourceNotFoundException Si el usuario o el taller no existen.
         * @throws BadRequestException       Si un alumno intenta inscribir a otro
         *                                   usuario distinto a él mismo.
         */
        @Transactional
        public InscripcionResponseDTO inscribir(InscripcionRequestDTO dto) {
                Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
                boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

                if (!esAdmin && !solicitante.getId().equals(dto.getIdUsuario())) {
                        throw new BadRequestException("No puedes realizar inscripciones para otros usuarios.");
                }

                Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Usuario no encontrado con ID: " + dto.getIdUsuario()));

                Taller taller = tallerRepository.findById(dto.getIdTaller())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Taller no encontrado con ID: " + dto.getIdTaller()));

                Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
                Inscripcion guardada = inscripcionRepository.save(inscripcion);
                InscripcionResponseDTO response = inscripcionMapper.toResponse(guardada);

                byte[] pdfFactura = pdfService.generarBytesPdf("factura-inscripcion", Map.of(
                                "inscripcion", response,
                                "usuario", usuario));

                emailService.enviarCorreoConAdjunto(
                                usuario.getEmail(),
                                "¡Inscripción Confirmada! - Recibo de " + taller.getNombre(),
                                "mail/confirmacion-inscripcion",
                                Map.of("usuario", usuario, "taller", taller),
                                pdfFactura,
                                "Factura_" + response.getIdInscripcion() + ".pdf");

                return response;
        }

        /**
         * Realiza la inscripción masiva de varios alumnos.
         * Busca al usuario por su email (que es lo que viene del CSV en el front).
         * * @param dtos Lista de peticiones de inscripción.
         * 
         * @return Lista de inscripciones procesadas.
         */
        @Transactional
        public List<InscripcionResponseDTO> inscribirMasivo(List<InscripcionRequestDTO> dtos) {
                return dtos.stream().map(dto -> {
                        Usuario usuario = usuarioRepository.findByEmail(dto.getEmailUsuario())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Usuario no encontrado: " + dto.getEmailUsuario()));

                        Taller taller = tallerRepository.findById(dto.getIdTaller())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Taller no encontrado: " + dto.getIdTaller()));

                        Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
                        Inscripcion guardada = inscripcionRepository.save(inscripcion);

                        InscripcionResponseDTO response = inscripcionMapper.toResponse(guardada);

                        emailService.enviarCorreo(
                                        usuario.getEmail(),
                                        "Confirmación de plaza: " + taller.getNombre(),
                                        "mail/confirmacion-inscripcion",
                                        Map.of("usuario", usuario, "taller", taller));
                        return response;
                }).collect(Collectors.toList());
        }

        // --- MÉTODOS GET ---

        /**
         * Obtiene el listado completo de inscripciones.
         * * @return Lista de todas las inscripciones.
         */
        @Transactional(readOnly = true)
        public List<InscripcionResponseDTO> listarTodas() {
                return inscripcionRepository.findAll().stream()
                                .map(inscripcionMapper::toResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Obtiene el listado de alumnos matriculados en un taller específico.
         * Este método permite al administrador consultar la "Lista de Clase" de
         * cualquier actividad.
         * * @param idTaller Identificador único del taller a consultar.
         * * @return Lista de DTOs con la información de los alumnos y sus estados de
         * 
         * @throws BadRequestException Si un profesor intenta ver los alumnos de un
         *                             taller que no le pertenece.
         *                             inscripción.
         */
        @Transactional(readOnly = true)
        public List<InscripcionResponseDTO> listarPorTaller(Long idTaller) {
                Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
                boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

                Taller taller = tallerRepository.findById(idTaller)
                                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

                if (!esAdmin && solicitante.getRol().getNombre().equalsIgnoreCase("PROFESOR")) {
                        if (taller.getProfesor() == null || !taller.getProfesor().getId().equals(solicitante.getId())) {
                                throw new BadRequestException(
                                                "No puedes ver los alumnos de un taller que no impartes.");
                        }
                }

                return inscripcionRepository.findByTallerId(idTaller).stream()
                                .map(inscripcionMapper::toResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Recupera una inscripción por su identificador único.
         * * @param id Identificador de la inscripción.
         * 
         * @return Inscripción encontrada.
         * @throws ResourceNotFoundException Si la inscripción no existe.
         * @throws BadRequestException       Si el usuario no tiene permisos (no es
         *                                   admin, ni el dueño de la inscripción, ni el
         *                                   profesor del taller).
         */
        @Transactional(readOnly = true)
        public InscripcionResponseDTO buscarPorId(Long id) {
                Inscripcion inscripcion = inscripcionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

                Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
                boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
                boolean esSuInscripcion = inscripcion.getUsuario().getId().equals(solicitante.getId());

                boolean esSuProfesor = inscripcion.getTaller().getProfesor() != null &&
                                inscripcion.getTaller().getProfesor().getId().equals(solicitante.getId());

                if (!esAdmin && !esSuInscripcion && !esSuProfesor) {
                        throw new BadRequestException("No tienes permiso para ver esta inscripción.");
                }

                return inscripcionMapper.toResponse(inscripcion);
        }

        /**
         * Lista todas las inscripciones asociadas a un usuario concreto.
         * * @param idUsuario ID del usuario.
         * 
         * @return Lista de sus inscripciones.
         * @throws BadRequestException Si un usuario intenta consultar las
         *                             inscripciones de otra persona.
         */
        @Transactional(readOnly = true)
        public List<InscripcionResponseDTO> listarPorUsuario(Long idUsuario) {
                Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
                boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

                if (!esAdmin && !solicitante.getId().equals(idUsuario)) {
                        throw new BadRequestException("No puedes consultar las inscripciones de otro usuario.");
                }

                return inscripcionRepository.findByUsuarioId(idUsuario).stream()
                                .map(inscripcionMapper::toResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Genera el PDF de una factura para una inscripción ya existente.
         * 
         * @throws BadRequestException Si el usuario intenta descargar una factura que
         *                             no le pertenece y no es administrador.
         */
        @Transactional(readOnly = true)
        public byte[] obtenerFacturaPdf(Long idInscripcion) {
                Inscripcion inscripcion = inscripcionRepository.findByIdIncludingInactive(idInscripcion)
                                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

                Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
                boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
                boolean esSuInscripcion = inscripcion.getUsuario().getId().equals(solicitante.getId());

                if (!esAdmin && !esSuInscripcion) {
                        throw new BadRequestException("No tienes permiso para descargar esta factura.");
                }

                return pdfService.generarBytesPdf("factura-inscripcion", Map.of(
                                "inscripcion", inscripcionMapper.toResponse(inscripcion),
                                "usuario", inscripcion.getUsuario()));
        }

        // --- MÉTODOS PUT ---

        /**
         * Actualiza los datos de una inscripción existente.
         * * @param id ID de la inscripción a modificar.
         * 
         * @param dto Nuevos datos.
         * @return Inscripción actualizada.
         * @throws ResourceNotFoundException Si la inscripción no existe.
         */
        /**
         * Actualiza los datos de una inscripción existente, validando la integridad
         * de los nuevos IDs de usuario y taller si se proporcionan.
         */
        @Transactional
        public InscripcionResponseDTO actualizar(Long id, InscripcionRequestDTO dto) {
                Inscripcion existente = inscripcionRepository.findByIdIncludingInactive(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe la inscripción para actualizar con ID: " + id));

                if (!existente.getUsuario().getId().equals(dto.getIdUsuario())) {
                        Usuario nuevoUsuario = usuarioRepository.findById(dto.getIdUsuario())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "No se puede actualizar: Nuevo Usuario no encontrado con ID: "
                                                                        + dto.getIdUsuario()));
                        existente.setUsuario(nuevoUsuario);
                }

                if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
                        Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "No se puede actualizar: Nuevo Taller no encontrado con ID: "
                                                                        + dto.getIdTaller()));
                        existente.setTaller(nuevoTaller);
                }

                existente.setMontoPagado(dto.getMontoPagado());
                existente.setOrderId(dto.getOrderId());

                return inscripcionMapper.toResponse(inscripcionRepository.save(existente));
        }

        /**
         * Alterna el estado de activación de una inscripción (Toggle).
         * Permite al administrador suspender o reactivar el acceso de un alumno a un
         * taller de forma manual, sin necesidad de eliminar el registro de la base de
         * datos.
         * * @param id Identificador único de la inscripción a modificar.
         * 
         * @return DTO con la información actualizada, reflejando el nuevo estado de la
         *         propiedad 'activa'.
         * @throws ResourceNotFoundException Si no se encuentra una inscripción con el
         *                                   ID proporcionado.
         */
        @Transactional
        public InscripcionResponseDTO cambiarEstado(Long id) {
                Inscripcion inscripcion = inscripcionRepository.findByIdIncludingInactive(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Inscripcion no encontrada con ID: " + id));

                inscripcion.setActiva(!inscripcion.isActiva());
                Inscripcion guardada = inscripcionRepository.save(inscripcion);

                String asunto;
                String plantilla;

                if (guardada.isActiva()) {
                        asunto = "¡Tu inscripción ha sido reactivada!";
                        plantilla = "mail/confirmacion-inscripcion";
                } else {
                        asunto = "Notificación: Tu inscripción ha sido suspendida";
                        plantilla = "mail/baja-taller";
                }

                emailService.enviarCorreo(
                                guardada.getUsuario().getEmail(),
                                asunto,
                                plantilla,
                                Map.of("usuario", guardada.getUsuario(), "taller", guardada.getTaller()));

                return inscripcionMapper.toResponse(guardada);
        }

        // --- MÉTODOS DELETE ---

        /**
         * Elimina permanentemente una inscripción del sistema.
         * * @param id ID de la inscripción a borrar.
         * 
         * @throws ResourceNotFoundException Si la inscripción no existe.
         */
        @Transactional
        public void eliminar(Long id) {
                Inscripcion inscripcion = inscripcionRepository.findByIdIncludingInactive(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No se pudo eliminar: ID " + id + " no encontrado"));

                Usuario usuario = inscripcion.getUsuario();
                Taller taller = inscripcion.getTaller();

                inscripcionRepository.delete(inscripcion);

                emailService.enviarCorreo(usuario.getEmail(), "Notificación de baja de taller", "mail/baja-taller",
                                Map.of("usuario", usuario, "taller", taller));
        }
}