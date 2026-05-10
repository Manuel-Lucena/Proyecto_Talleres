package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.service.HorarioService;
import com.mlg.taller.service.PdfService;
import com.mlg.taller.service.UsuarioService;
import com.mlg.taller.util.ApiResponse;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de horarios de los talleres.
 * Permite definir las franjas horarias de las sesiones, consultarlas por taller
 * y realizar modificaciones o eliminaciones de los turnos establecidos.
 */
@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;
    private final PdfService pdfService;
    private final UsuarioService usuarioService;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo horario en el sistema.
     * 
     * @param dto Datos del horario a crear (días, horas, taller asociado).
     * @return ApiResponse con el horario creado y mensaje de confirmación.
     */
    @PostMapping
    public ApiResponse<HorarioResponseDTO> crear(@RequestBody HorarioRequestDTO dto) {
        return ApiResponse.success(horarioService.crear(dto), "Horario creado");
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de todos los horarios registrados en el sistema.
     * 
     * @return ApiResponse con la lista global de horarios.
     */
    @GetMapping
    public ApiResponse<List<HorarioResponseDTO>> listarTodos() {
        return ApiResponse.success(horarioService.listarTodos(), "Todos los horarios obtenidos");
    }

    /**
     * Recupera la planificación horaria personal de un usuario.
     * Filtra los horarios basándose únicamente en los talleres donde el usuario
     * figura como inscrito.
     * * @param idUsuario Identificador del usuario.
     * 
     * @return ApiResponse con la lista de horarios que forman su calendario
     *         personal.
     */
    @GetMapping("/usuario/{idUsuario}")
    public ApiResponse<List<HorarioResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ApiResponse.success(horarioService.listarPorUsuario(idUsuario),
                "Agenda personal obtenida correctamente");
    }

    /**
     * Recupera los horarios específicos vinculados a un taller concreto.
     * 
     * @param idTaller Identificador único del taller.
     * @return ApiResponse con la lista de horarios del taller solicitado.
     */
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<HorarioResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(horarioService.listarPorTaller(idTaller), "Horarios del taller obtenidos");
    }


    /**
     * Recupera la planificación horaria de los talleres que imparte un profesor.
     * * @param idProfesor Identificador del profesor.
     * 
     * @return ApiResponse con la lista de horarios de sus clases.
     */
    @GetMapping("/profesor/{idProfesor}")
    public ApiResponse<List<HorarioResponseDTO>> listarPorProfesor(@PathVariable Long idProfesor) {
        return ApiResponse.success(horarioService.listarPorProfesor(idProfesor),
                "Agenda de profesor obtenida correctamente");
    }

    /**
     * Genera y descarga un PDF con la agenda semanal personalizada de un usuario.
     * El documento organiza cronológicamente todas las sesiones de los talleres
     * en los que el usuario está actualmente inscrito.
     * * @param idUsuario Identificador del usuario que solicita su agenda.
     * 
     * @param response Objeto HttpServletResponse para la descarga del flujo
     *                 binario.
     */
    @GetMapping("/usuario/{idUsuario}/pdf")
    public void descargarAgendaPdf(@PathVariable Long idUsuario, HttpServletResponse response) {
        var usuario = usuarioService.buscarPorId(idUsuario);

        List<HorarioResponseDTO> horarios;
        if ("PROFESOR".equals(usuario.getNombreRol())) {
            horarios = horarioService.listarPorProfesor(idUsuario);
        } else {
            horarios = horarioService.listarPorUsuario(idUsuario);
        }

        response.setHeader("Content-Disposition", "attachment; filename=Agenda_" + usuario.getNombre() + ".pdf");
        pdfService.generarPdf("agenda-semanal", Map.of(
                "usuario", usuario,
                "horarios", horarios), response);
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de un horario existente.
     * 
     * @param id  Identificador del horario a modificar.
     * @param dto Nuevos datos para el horario.
     * @return ApiResponse con el objeto HorarioResponseDTO actualizado.
     */
    @PutMapping("/{id}")
    public ApiResponse<HorarioResponseDTO> actualizar(@PathVariable Long id, @RequestBody HorarioRequestDTO dto) {
        return ApiResponse.success(horarioService.actualizar(id, dto), "Horario actualizado");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma definitiva un registro de horario.
     * 
     * @param id Identificador único del horario a suprimir.
     * @return ApiResponse confirmando la eliminación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        horarioService.eliminar(id);
        return ApiResponse.success(null, "Horario eliminado");
    }
}