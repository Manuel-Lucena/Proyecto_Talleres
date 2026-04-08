package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.service.InscripcionService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de inscripciones de alumnos en los talleres.
 * Permite tramitar nuevas altas, consultar el historial de talleres por usuario
 * y administrar el estado de las inscripciones existentes.
 */
@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InscripcionController {

    private final InscripcionService inscripcionService;

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
     * Endpoint para pausar/reactivar una inscripción (Toggle).
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