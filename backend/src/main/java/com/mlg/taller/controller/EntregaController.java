package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.service.EntregaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;

    @GetMapping
    public ApiResponse<List<EntregaResponseDTO>> listarTodas() {
        return ApiResponse.success(entregaService.listarTodas(), "Listado de entregas obtenido");
    }

    @GetMapping("/{id}")
    public ApiResponse<EntregaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(entregaService.buscarPorId(id), "Entrega encontrada");
    }

    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<EntregaResponseDTO>> listarPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(entregaService.listarPorTarea(idTarea), "Entregas de la tarea obtenidas");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EntregaResponseDTO> enviar(@Valid @RequestBody EntregaRequestDTO dto) {
        return ApiResponse.success(entregaService.enviar(dto), "Trabajo entregado correctamente");
    }

    @PatchMapping("/{id}/calificar")
    public ApiResponse<EntregaResponseDTO> calificar(@PathVariable Long id, @RequestBody EntregaRequestDTO dto) {
        return ApiResponse.success(entregaService.calificar(id, dto), "Calificación registrada");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        entregaService.eliminar(id);
        return ApiResponse.success(null, "Entrega eliminada correctamente");
    }
}