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

@RestController
@RequestMapping("/api/materiales")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    // Crear material
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MaterialResponseDTO> crear(@Valid @RequestBody MaterialRequestDTO dto) {
        return ApiResponse.success(materialService.crear(dto), "Material creado con éxito");
    }

    // Obtener todos los materiales
    @GetMapping
    public ApiResponse<List<MaterialResponseDTO>> listarTodos() {
        return ApiResponse.success(materialService.listarTodos(), "Listado de materiales obtenido");
    }

    // Obtener un material por su ID
    @GetMapping("/{id}")
    public ApiResponse<MaterialResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(materialService.buscarPorId(id), "Material encontrado");
    }

    // Obtener todos los materiales de un taller específico
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<MaterialResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(materialService.listarPorTaller(idTaller), "Materiales del taller obtenidos");
    }

    // Actualizar un material
    @PutMapping("/{id}")
    public ApiResponse<MaterialResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MaterialRequestDTO dto) {
        return ApiResponse.success(materialService.actualizar(id, dto), "Material actualizado correctamente");
    }

    // Eliminar un material
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        materialService.eliminar(id);
        return ApiResponse.success(null, "Material eliminado correctamente");
    }
}