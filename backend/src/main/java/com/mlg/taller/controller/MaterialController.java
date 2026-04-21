package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.MaterialRequestDTO;
import com.mlg.taller.model.dtos.MaterialResponseDTO;
import com.mlg.taller.service.MaterialService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de materiales didácticos asociados a los
 * talleres.
 * Permite la creación, consulta y administración de los recursos que los
 * instructores ponen a disposición de los alumnos.
 */
@RestController
@RequestMapping("/api/materiales")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo material didáctico en el sistema.
     * 
     * @param dto Objeto con la información del material (validado mediante @Valid).
     * @return ApiResponse con el material creado y estado HTTP 201.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MaterialResponseDTO> crear(@Valid @RequestBody MaterialRequestDTO dto) {
        return ApiResponse.success(materialService.crear(dto), "Material creado con éxito");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el listado completo de todos los materiales registrados.
     * * @return ApiResponse con la lista global de materiales.
     */
    @GetMapping
    public ApiResponse<List<MaterialResponseDTO>> listarTodos() {
        return ApiResponse.success(materialService.listarTodos(), "Listado de materiales obtenido");
    }

    /**
     * Busca un material específico mediante su identificador único.
     * * @param id Identificador del material a buscar.
     * 
     * @return ApiResponse con el material encontrado.
     */
    @GetMapping("/{id}")
    public ApiResponse<MaterialResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(materialService.buscarPorId(id), "Material encontrado");
    }

    /**
     * [ALUMNO] Obtiene solo los materiales marcados como visibles de un taller.
     * * @param idTaller Identificador del taller.
     * 
     * @return ApiResponse con la lista de materiales visibles.
     */
    @GetMapping("/taller/{idTaller}/visibles")
    public ApiResponse<List<MaterialResponseDTO>> listarVisiblesParaAlumno(@PathVariable Long idTaller) {
        return ApiResponse.success(materialService.listarVisibles(idTaller), "Materiales visibles obtenidos");
    }

    /**
     * Obtiene todos los materiales vinculados a un taller específico.
     * * @param idTaller Identificador del taller.
     * 
     * @return ApiResponse con la lista de materiales del taller solicitado.
     */
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<MaterialResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(materialService.listarPorTaller(idTaller), "Materiales del taller obtenidos");
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de un material existente.
     * 
     * @param id  Identificador del material a modificar.
     * @param dto Nuevos datos para el material (validado mediante @Valid).
     * @return ApiResponse con el material actualizado.
     */
    @PutMapping("/{id}")
    public ApiResponse<MaterialResponseDTO> actualizar(@PathVariable Long id,
            @Valid @RequestBody MaterialRequestDTO dto) {
        return ApiResponse.success(materialService.actualizar(id, dto), "Material actualizado correctamente");
    }

    /**
     * Alterna el estado de visibilidad de un material.
     * 
     * @param id Identificador del material.
     * @return ApiResponse con el material actualizado.
     */
    @PutMapping("/{id}/visibilidad")
    public ApiResponse<MaterialResponseDTO> cambiarVisibilidad(@PathVariable Long id) {
        return ApiResponse.success(materialService.cambiarVisibilidad(id), "Visibilidad del material actualizada");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma definitiva un material del sistema.
     * 
     * @param id Identificador único del material a suprimir.
     * @return ApiResponse confirmando la eliminación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        materialService.eliminar(id);
        return ApiResponse.success(null, "Material eliminado correctamente");
    }
}