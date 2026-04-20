package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.service.TallerService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador REST para la gestión de talleres educativos.
 * Gestiona el catálogo de actividades, inscripciones disponibles y la
 * asignación de profesores.
 */
@RestController
@RequestMapping("/api/talleres")
@RequiredArgsConstructor
public class TallerController {

    private final TallerService tallerService;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo taller en el sistema, permitiendo adjuntar una imagen
     * promocional.
     * El cuerpo de la petición debe ser multipart/form-data.
     * 
     * @param request Datos del taller en formato JSON (parte 'taller').
     * @param archivo Imagen representativa del taller (parte 'archivo', opcional).
     * @return ApiResponse con el taller creado y su ruta de imagen generada.
     */
    @PostMapping(consumes = { "multipart/form-data" })
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TallerResponseDTO> crear(
            @Valid @RequestPart("taller") TallerRequestDTO request,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        return ApiResponse.success(tallerService.crear(request, archivo), "Taller creado con éxito");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el catálogo completo de talleres activos en el sistema.
     * 
     * @return ApiResponse con una lista de TallerResponseDTO con plazas y profesor.
     */
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<TallerResponseDTO>> listarTodos() {
        return ApiResponse.success(tallerService.listarTodos(), "Lista de talleres obtenida");
    }

    /**
     * Obtiene la información detallada de un taller específico por su ID.
     * 
     * @param id Identificador único del taller.
     * @return ApiResponse con los datos detallados del taller solicitado.
     */
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<TallerResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(tallerService.buscarPorId(id), "Detalle del taller");
    }

    /**
     * Obtiene los talleres en los que un usuario específico está inscrito.
     * 
     * @param idUsuario ID del alumno.
     * @return Lista de talleres para la vista "Mis Talleres".
     */
    @GetMapping("/usuario/{idUsuario}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<TallerResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ApiResponse.success(tallerService.listarTalleresPorUsuarioId(idUsuario),
                "Mis talleres obtenidos correctamente");
    }

    /**
     * Obtiene los talleres impartidos por un profesor específico.
     * 
     * @param idProfesor ID del usuario con rol profesor.
     * @return ApiResponse con la lista de talleres bajo la tutela del profesor.
     */
    @GetMapping("/profesor/{idProfesor}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<TallerResponseDTO>> listarPorProfesor(@PathVariable Long idProfesor) {
        return ApiResponse.success(tallerService.listarTalleresPorProfesorId(idProfesor),
                "Talleres impartidos obtenidos correctamente");
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información y/o la imagen de un taller existente.
     * Si no se proporciona un nuevo archivo, se preserva la imagen anterior.
     * 
     * @param id      Identificador del taller a modificar.
     * @param request Nuevos datos para el taller (parte 'taller').
     * @param archivo Nueva imagen para el taller (parte 'archivo', opcional).
     * @return ApiResponse con el taller actualizado.
     */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<TallerResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestPart("taller") TallerRequestDTO request,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        return ApiResponse.success(tallerService.actualizar(id, request, archivo), "Taller actualizado correctamente");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Realiza la eliminación de un taller del sistema.
     * 
     * @param id Identificador del taller a eliminar.
     * @return ApiResponse confirmando la eliminación.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        tallerService.eliminar(id);
        return ApiResponse.success(null, "Taller eliminado correctamente");
    }
}