package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.service.MensajeService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
@RequiredArgsConstructor
public class MensajeController {

    private final MensajeService mensajeService;

    @PostMapping
    public ApiResponse<MensajeResponseDTO> enviar(@RequestBody MensajeRequestDTO dto) {
        return ApiResponse.success(mensajeService.enviar(dto), "Mensaje enviado correctamente");
    }

    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<MensajeResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(mensajeService.listarPorTaller(idTaller), "Historial del taller obtenido");
    }

    @GetMapping
    public ApiResponse<List<MensajeResponseDTO>> listarTodos() {
        return ApiResponse.success(mensajeService.listarTodos(), "Todos los mensajes obtenidos");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        mensajeService.eliminar(id);
        return ApiResponse.success(null, "Mensaje eliminado");
    }
}