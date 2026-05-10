package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.dtos.NotasAlumnoDTO;
import com.mlg.taller.service.InscripcionService;
import com.mlg.taller.service.PdfService;
import com.mlg.taller.service.TallerService;
import com.mlg.taller.util.ApiResponse;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de inscripciones de alumnos en los talleres.
 * Permite tramitar nuevas altas, consultar el historial de talleres por usuario
 * y administrar el estado de las inscripciones existentes.
 */
@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
public class InscripcionController {

    private final InscripcionService inscripcionService;
    private final TallerService tallerService; //
    private final PdfService pdfService;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva inscripción de un usuario en un taller.
     * 
     * @param dto Objeto con los datos necesarios para realizar la inscripción
     *            (validado mediante @Valid).
     * @return ApiResponse con el detalle de la inscripción realizada y estado 201.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InscripcionResponseDTO> inscribir(@Valid @RequestBody InscripcionRequestDTO dto) {
        return ApiResponse.success(inscripcionService.inscribir(dto), "Inscripción realizada con éxito");
    }

    /**
     * Registra múltiples inscripciones de forma masiva.
     * Útil para importar alumnos desde un CSV.
     *
     * @param dtos Lista de inscripciones a procesar.
     * @return ApiResponse con la lista de inscripciones creadas.
     */
    @PostMapping("/masivo")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<InscripcionResponseDTO>> inscribirMasivo(
            @Valid @RequestBody List<InscripcionRequestDTO> dtos) {
        return ApiResponse.success(inscripcionService.inscribirMasivo(dtos), "Importación masiva completada con éxito");
    }
    // --- MÉTODOS GET ---

    /**
     * Recupera el listado global de todas las inscripciones del sistema.
     * 
     * @return ApiResponse con la lista completa de inscripciones (Vista
     *         Administrador).
     */
    @GetMapping
    public ApiResponse<List<InscripcionResponseDTO>> listarTodas() {
        return ApiResponse.success(inscripcionService.listarTodas(), "Listado de inscripciones obtenido");
    }

    /**
     * Obtiene el listado de alumnos inscritos en un taller específico.
     * 
     * @param idTaller Identificador único del taller.
     * @return ApiResponse con la lista de alumnos matriculados.
     */
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<InscripcionResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(inscripcionService.listarPorTaller(idTaller), "Alumnos del taller obtenidos");
    }

    /**
     * Busca la información de una inscripción específica mediante su identificador
     * único.
     * 
     * @param id Identificador de la inscripción a buscar.
     * @return ApiResponse con la información de la inscripción encontrada.
     */
    @GetMapping("/{id}")
    public ApiResponse<InscripcionResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(inscripcionService.buscarPorId(id), "Inscripción encontrada");
    }

    /**
     * Obtiene el historial de inscripciones asociadas a un usuario concreto.
     * 
     * @param idUsuario Identificador único del usuario.
     * @return ApiResponse con la lista de talleres donde el usuario está inscrito.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ApiResponse<List<InscripcionResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ApiResponse.success(inscripcionService.listarPorUsuario(idUsuario),
                "Inscripciones del usuario obtenidas");
    }

    /**
     * Obtiene el resumen de calificaciones y entregas de todos los alumnos del taller.
     * * @param idTaller Identificador único del taller.
     * @return ApiResponse con la lista de DTOs que contienen promedios y conteo de tareas.
     */
    @GetMapping("/taller/{idTaller}/notas-globales")
    public ApiResponse<List<NotasAlumnoDTO>> obtenerNotasGlobales(@PathVariable Long idTaller) {
        return ApiResponse.success(inscripcionService.obtenerNotasGlobales(idTaller), "Notas obtenidas");
    }

    /**
     * Genera y descarga un PDF con la lista de alumnos inscritos en un taller.
     * * @param idTaller Identificador del taller.
     * 
     * @param response Objeto para escribir el flujo del archivo.
     */
    @GetMapping("/taller/{idTaller}/pdf")
    public void descargarListaPdf(@PathVariable Long idTaller, HttpServletResponse response) {
        var taller = tallerService.buscarPorId(idTaller);
        var inscripciones = inscripcionService.listarPorTaller(idTaller);

        String nombreArchivo = "pdf/lista_alumnos_" + idTaller + ".pdf";

        response.setHeader("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"");

        pdfService.generarPdf("lista-alumnos", Map.of(
                "taller", taller,
                "inscripciones", inscripciones), response);
    }

    /**
     * Verifica si un taller nuevo se solapa con los horarios de los talleres
     * en los que el usuario ya está inscrito.
     *
     * @param idUsuario ID del alumno.
     * @param idTaller  ID del taller al que se quiere inscribir.
     * @return Respuesta con un booleano y el nombre del taller en conflicto si
     *         existe.
     */
    @GetMapping("/validar-solapamiento/usuario/{idUsuario}/taller/{idTaller}")
    public ApiResponse<Map<String, Object>> validarSolapamiento(
            @PathVariable Long idUsuario,
            @PathVariable Long idTaller) {
        return ApiResponse.success(
                inscripcionService.validarSolapamientoHorarios(idUsuario, idTaller),
                "Validación de horarios completada");
    }

    /**
     * Genera el recibo oficial de inscripción en formato PDF para el alumno.
     * Incluye detalles del pago, datos del usuario y confirmación de la plaza
     * para que sirva como justificante legal.
     * * @param id Identificador de la inscripción de la cual se genera la factura.
     * 
     * @param response Objeto HttpServletResponse para la descarga directa del
     *                 archivo.
     */
    @GetMapping("/{id}/factura")
    public void descargarFactura(@PathVariable Long id, HttpServletResponse response) {

        var dto = inscripcionService.buscarPorId(id);

        String nombreArchivo = "Factura_Inscripcion_" + id + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"");
        pdfService.generarPdf("factura-inscripcion", Map.of(
                "inscripcion", dto), response);
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de una inscripción existente (por ejemplo, gestión de
     * pagos o cambios de estado).
     * 
     * @param id  Identificador de la inscripción a modificar.
     * @param dto Datos actualizados de la inscripción (validado mediante @Valid).
     * @return ApiResponse con la inscripción actualizada.
     */
    @PutMapping("/{id}")
    public ApiResponse<InscripcionResponseDTO> actualizar(@PathVariable Long id,
            @Valid @RequestBody InscripcionRequestDTO dto) {
        return ApiResponse.success(inscripcionService.actualizar(id, dto), "Inscripción actualizada");
    }

    /**
     * Endpoint para pausar/reactivar una inscripción.
     * 
     * @param id Identificador de la inscripción.
     * @return Inscripción con el estado 'activa' cambiado.
     */
    @PutMapping("/{id}/estado")
    public ApiResponse<InscripcionResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ApiResponse.success(inscripcionService.cambiarEstado(id), "Estado de inscripción actualizado");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una inscripción del sistema (se recomienda borrado lógico en el
     * service).
     * 
     * @param id Identificador único de la inscripción a suprimir.
     * @return ApiResponse confirmando la eliminación del registro.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        inscripcionService.eliminar(id);
        return ApiResponse.success(null, "Inscripción eliminada correctamente");
    }
}