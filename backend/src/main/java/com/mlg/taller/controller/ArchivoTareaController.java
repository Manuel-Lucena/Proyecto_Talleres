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

    @GetMapping
    public ApiResponse<List<ArchivoTareaResponseDTO>> listarTodos() {
        return ApiResponse.success(archivoTareaService.listarTodos(), "Listado completo de archivos obtenido");
    }

    @GetMapping("/{id}")
    public ApiResponse<ArchivoTareaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(archivoTareaService.buscarPorId(id), "Archivo encontrado");
    }

    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<ArchivoTareaResponseDTO>> listarPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(archivoTareaService.listarPorTarea(idTarea), "Archivos de la tarea obtenidos");
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArchivoTareaResponseDTO> guardar(
            @RequestPart("datos") @Valid ArchivoTareaRequestDTO dto,
            @RequestPart("archivo") org.springframework.web.multipart.MultipartFile file) {
        return ApiResponse.success(archivoTareaService.guardar(dto, file), "Archivo registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<ArchivoTareaResponseDTO> actualizar(@PathVariable Long id,
            @Valid @RequestBody ArchivoTareaRequestDTO dto) {
        return ApiResponse.success(archivoTareaService.actualizar(id, dto), "Archivo actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoTareaService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado correctamente");
    }
}