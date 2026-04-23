package com.mlg.taller.service;

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
import com.mlg.taller.service.validators.InscripcionValidator;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de inscripciones de usuarios en talleres.
 * 
 * Se encarga de la lógica de matriculación, facturación en PDF, notificaciones
 * por correo electrónico y el control de acceso administrativo.
 * Delega la validación de reglas de negocio en el componente de validación.
 */
@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionValidator inscripcionValidator;
    private final InscripcionMapper inscripcionMapper;
    private final EmailService emailService;
    private final PdfService pdfService;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva inscripción individual en el sistema.
     * 
     * El proceso incluye: validación de duplicados, persistencia, generación
     * de comprobante de pago en PDF y envío de notificación por email.
     *
     * @param dto Datos de la inscripción.
     * @return DTO con la información de la inscripción confirmada.
     */
    @Transactional
    public InscripcionResponseDTO inscribir(InscripcionRequestDTO dto) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        inscripcionValidator.validarPropiedadOSolicitante(solicitante, dto.getIdUsuario());

        Usuario usuario = buscarUsuarioInterno(dto.getIdUsuario());
        Taller taller = buscarTallerInterno(dto.getIdTaller());
        inscripcionValidator.verificarDuplicado(usuario.getId(), taller.getId());

        Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
        Inscripcion guardada = inscripcionRepository.save(inscripcion);
        InscripcionResponseDTO response = inscripcionMapper.toResponse(guardada);

        byte[] pdfFactura = pdfService.generarBytesPdf("factura-inscripcion", Map.of(
                "inscripcion", response, "usuario", usuario));

        emailService.enviarCorreoConAdjunto(
                usuario.getEmail(),
                "¡Inscripción Confirmada! - " + taller.getNombre(),
                "mail/confirmacion-inscripcion",
                Map.of("usuario", usuario, "taller", taller),
                pdfFactura,
                "Factura_" + response.getIdInscripcion() + ".pdf");

        return response;
    }

    /**
     * Procesa múltiples inscripciones de forma masiva.
     * 
     * Realiza validaciones de duplicados por cada registro y envía
     * notificaciones simples de confirmación.
     *
     * @param dtos Lista de peticiones de inscripción.
     * @return Lista de respuestas procesadas con éxito.
     */
    @Transactional
    public List<InscripcionResponseDTO> inscribirMasivo(List<InscripcionRequestDTO> dtos) {
        return dtos.stream().map(dto -> {
            Usuario usuario = usuarioRepository.findByEmail(dto.getEmailUsuario())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Usuario no encontrado: " + dto.getEmailUsuario()));
            Taller taller = buscarTallerInterno(dto.getIdTaller());

            inscripcionValidator.verificarDuplicado(usuario.getId(), taller.getId());

            Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
            Inscripcion guardada = inscripcionRepository.save(inscripcion);

            emailService.enviarCorreo(usuario.getEmail(),
                    "Confirmación de plaza: " + taller.getNombre(),
                    "mail/confirmacion-inscripcion",
                    Map.of("usuario", usuario, "taller", taller));

            return inscripcionMapper.toResponse(guardada);
        }).collect(Collectors.toList());
    }

    // --- MÉTODOS GET ---

    /**
     * Lista todas las inscripciones del sistema (Solo para administradores).
     * * @return Lista de todas las inscripciones.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarTodas() {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        if (!solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new com.mlg.taller.exception.BadRequestException("Acceso denegado al listado global.");
        }
        return inscripcionRepository.findAll().stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera los alumnos matriculados en un taller.
     * 
     * Permite al profesor del taller o al administrador obtener la lista de clase.
     *
     * @param idTaller ID del taller a consultar.
     * @return Lista de inscripciones vinculadas al taller.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = buscarTallerInterno(idTaller);
        inscripcionValidator.validarAccesoListaTaller(SecurityUtils.getUsuarioAutenticado(), taller);

        return inscripcionRepository.findByTallerId(idTaller).stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca una inscripción específica validando permisos de acceso.
     * * @param id ID de la inscripción.
     * 
     * @return Inscripción encontrada.
     */
    @Transactional(readOnly = true)
    public InscripcionResponseDTO buscarPorId(Long id) {
        Inscripcion inscripcion = buscarInscripcionInterna(id);
        inscripcionValidator.validarAccesoInscripcion(SecurityUtils.getUsuarioAutenticado(), inscripcion);
        return inscripcionMapper.toResponse(inscripcion);
    }

    /**
     * Lista las inscripciones de un usuario concreto.
     * * @param idUsuario ID del usuario.
     * 
     * @return Lista de sus inscripciones.
     */
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarPorUsuario(Long idUsuario) {
        inscripcionValidator.validarPropiedadOSolicitante(SecurityUtils.getUsuarioAutenticado(), idUsuario);
        return inscripcionRepository.findByUsuarioId(idUsuario).stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Analiza la agenda del alumno revisando todos los horarios de sus talleres
     * actuales para detectar posibles colisiones con el nuevo taller.
     * * @param idUsuario Identificador único del alumno.
     * 
     * @param idTaller Identificador del taller al que desea apuntarse.
     * @return Un mapa con el estado del conflicto y el nombre del taller
     *         coincidente.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> validarSolapamientoHorarios(Long idUsuario, Long idTaller) {
    
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        inscripcionValidator.validarPropiedadOSolicitante(solicitante, idUsuario);
 
        Taller tallerNuevo = buscarTallerInterno(idTaller);
        List<Inscripcion> inscripcionesActivas = inscripcionRepository.findByUsuarioId(idUsuario)
                .stream()
                .filter(Inscripcion::isActiva)
                .collect(Collectors.toList());

        for (Inscripcion registro : inscripcionesActivas) {
            Taller tallerInscrito = registro.getTaller();

         
            if (tallerInscrito.getId().equals(idTaller))
                continue;

           
            if (inscripcionValidator.verificarSolapamiento(tallerNuevo, tallerInscrito)) {
                return Map.of(
                        "hayConflicto", true,
                        "tallerConflicto", tallerInscrito.getNombre());
            }
        }

        return Map.of("hayConflicto", false);
    }

    /**
     * Genera el PDF de la factura para una inscripción existente.
     * * @param idInscripcion ID de la inscripción.
     * 
     * @return Array de bytes con el PDF.
     */
    @Transactional(readOnly = true)
    public byte[] obtenerFacturaPdf(Long idInscripcion) {
        Inscripcion inscripcion = buscarInscripcionInterna(idInscripcion);
        inscripcionValidator.validarAccesoFactura(SecurityUtils.getUsuarioAutenticado(), inscripcion);

        return pdfService.generarBytesPdf("factura-inscripcion", Map.of(
                "inscripcion", inscripcionMapper.toResponse(inscripcion),
                "usuario", inscripcion.getUsuario()));
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de pago o vinculación de una inscripción.
     * * @param id ID de la inscripción.
     * 
     * @param dto Datos actualizados.
     * @return Inscripción actualizada.
     */
    @Transactional
    public InscripcionResponseDTO actualizar(Long id, InscripcionRequestDTO dto) {
        Inscripcion existente = buscarInscripcionInterna(id);

        if (!existente.getUsuario().getId().equals(dto.getIdUsuario())) {
            existente.setUsuario(buscarUsuarioInterno(dto.getIdUsuario()));
        }
        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            existente.setTaller(buscarTallerInterno(dto.getIdTaller()));
        }

        existente.setMontoPagado(dto.getMontoPagado());
        existente.setOrderId(dto.getOrderId());

        return inscripcionMapper.toResponse(inscripcionRepository.save(existente));
    }

    /**
     * Alterna el estado de activación de una inscripción y notifica al usuario.
     * * @param id ID de la inscripción.
     * 
     * @return Inscripción con el estado modificado.
     */
    @Transactional
    public InscripcionResponseDTO cambiarEstado(Long id) {
        Inscripcion inscripcion = buscarInscripcionInterna(id);
        inscripcion.setActiva(!inscripcion.isActiva());

        Inscripcion guardada = inscripcionRepository.save(inscripcion);

        String asunto = guardada.isActiva() ? "Inscripción Reactivada" : "Inscripción Suspendida";
        String plantilla = guardada.isActiva() ? "mail/confirmacion-inscripcion" : "mail/baja-taller";

        emailService.enviarCorreo(guardada.getUsuario().getEmail(), asunto, plantilla,
                Map.of("usuario", guardada.getUsuario(), "taller", guardada.getTaller()));

        return inscripcionMapper.toResponse(guardada);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina físicamente el registro de inscripción y notifica al usuario.
     * * @param id ID de la inscripción.
     */
    @Transactional
    public void eliminar(Long id) {
        Inscripcion inscripcion = buscarInscripcionInterna(id);
        Usuario usuario = inscripcion.getUsuario();
        Taller taller = inscripcion.getTaller();

        inscripcionRepository.delete(inscripcion);

        emailService.enviarCorreo(usuario.getEmail(), "Baja de taller", "mail/baja-taller",
                Map.of("usuario", usuario, "taller", taller));
    }

    // --- MÉTODOS PRIVADOS ---

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Realiza una búsqueda interna de un usuario por su identificador único.
     * 
     * @param id Identificador del usuario.
     * @return Entidad Usuario encontrada.
     * @throws ResourceNotFoundException si el usuario no existe.
     */
    private Usuario buscarUsuarioInterno(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un taller por su identificador único.
     * 
     * @param id Identificador del taller.
     * @return Entidad Taller encontrada.
     * @throws ResourceNotFoundException si el taller no existe.
     */
    private Taller buscarTallerInterno(Long id) {
        return tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Recupera una inscripción de la base de datos, incluyendo aquellas marcadas
     * como inactivas.
     * 
     * @param id Identificador único de la inscripción.
     * @return Entidad Inscripcion encontrada (activa o inactiva).
     * @throws ResourceNotFoundException si no se encuentra el registro de
     *                                   inscripción.
     */
    private Inscripcion buscarInscripcionInterna(Long id) {
        return inscripcionRepository.findByIdIncludingInactive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada con ID: " + id));
    }
}