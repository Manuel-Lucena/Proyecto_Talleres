package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.service.ArchivoEntregaService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archivos-entrega")
@RequiredArgsConstructor
public class ArchivoEntregaController {

    private final ArchivoEntregaService archivoEntregaService;

    @PostMapping
    public ApiResponse<ArchivoEntregaResponseDTO> guardar(@RequestBody ArchivoEntregaRequestDTO dto) {
        return ApiResponse.success(archivoEntregaService.guardar(dto), "Archivo de entrega guardado");
    }

    @GetMapping("/entrega/{idEntrega}")
    public ApiResponse<List<ArchivoEntregaResponseDTO>> listarPorEntrega(@PathVariable Long idEntrega) {
        return ApiResponse.success(archivoEntregaService.listarPorEntrega(idEntrega), "Archivos obtenidos");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoEntregaService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado");
    }
}