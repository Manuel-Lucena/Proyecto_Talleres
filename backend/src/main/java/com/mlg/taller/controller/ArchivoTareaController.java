package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.service.ArchivoTareaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archivos-tarea")
@RequiredArgsConstructor
public class ArchivoTareaController {

    private final ArchivoTareaService archivoTareaService;

    // 1. GET - Listar todos (Admin)
    @GetMapping
    public ApiResponse<List<ArchivoTareaResponseDTO>> listarTodos() {
        return ApiResponse.success(archivoTareaService.listarTodos(), "Listado completo de archivos obtenido");
    }

    // 2. GET - Buscar por ID
    @GetMapping("/{id}")
    public ApiResponse<ArchivoTareaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(archivoTareaService.buscarPorId(id), "Archivo encontrado");
    }

    // 3. GET - Listar por Tarea específica
    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<ArchivoTareaResponseDTO>> listarPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(archivoTareaService.listarPorTarea(idTarea), "Archivos de la tarea obtenidos");
    }

    // 4. POST - Guardar nuevo archivo
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArchivoTareaResponseDTO> guardar(@Valid @RequestBody ArchivoTareaRequestDTO dto) {
        return ApiResponse.success(archivoTareaService.guardar(dto), "Archivo registrado correctamente");
    }

    // 5. PUT - Actualizar archivo existente
    @PutMapping("/{id}")
    public ApiResponse<ArchivoTareaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody ArchivoTareaRequestDTO dto) {
        return ApiResponse.success(archivoTareaService.actualizar(id, dto), "Archivo actualizado correctamente");
    }

    // 6. DELETE - Eliminar archivo
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoTareaService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado correctamente");
    }
}