package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.service.ArchivoMaterialService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archivos-material")
@RequiredArgsConstructor
public class ArchivoMaterialController {

    private final ArchivoMaterialService archivoMaterialService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ApiResponse<ArchivoMaterialResponseDTO> guardar(
            @RequestPart("datos") ArchivoMaterialRequestDTO dto,
            @RequestPart("archivo") org.springframework.web.multipart.MultipartFile file) {
        return ApiResponse.success(archivoMaterialService.guardar(dto, file), "Archivo de material guardado");
    }

    @GetMapping("/material/{idMaterial}")
    public ApiResponse<List<ArchivoMaterialResponseDTO>> listarPorMaterial(@PathVariable Long idMaterial) {
        return ApiResponse.success(archivoMaterialService.listarPorMaterial(idMaterial), "Archivos obtenidos");
    }

    @PutMapping("/{id}")
    public ApiResponse<ArchivoMaterialResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody ArchivoMaterialRequestDTO dto) {
        // Ahora que el método existe en el Service, el error desaparece
        return ApiResponse.success(archivoMaterialService.actualizar(id, dto), "Archivo actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoMaterialService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado");
    }
}