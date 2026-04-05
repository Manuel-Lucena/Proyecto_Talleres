package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.service.TareaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;

    @GetMapping
    public ApiResponse<List<TareaResponseDTO>> listar() {
        return ApiResponse.success(tareaService.listarTodas(), "Tareas obtenidas");
    }

    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<TareaResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(tareaService.listarPorTaller(idTaller), "Tareas del taller obtenidas");
    }

    @GetMapping("/{id}")
    public ApiResponse<TareaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(tareaService.obtenerPorId(id), "Tarea obtenida con éxito");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TareaResponseDTO> crear(@Valid @RequestBody TareaRequestDTO dto) {
        return ApiResponse.success(tareaService.crear(dto), "Tarea creada con éxito");
    }

    @PutMapping("/{id}")
    public ApiResponse<TareaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody TareaRequestDTO dto) {
        return ApiResponse.success(tareaService.actualizar(id, dto), "Tarea actualizada correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        tareaService.eliminar(id);
        return ApiResponse.success(null, "Tarea eliminada correctamente");
    }
}