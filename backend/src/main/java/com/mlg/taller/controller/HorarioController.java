package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.service.HorarioService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

    @PostMapping
    public ApiResponse<HorarioResponseDTO> crear(@RequestBody HorarioRequestDTO dto) {
        return ApiResponse.success(horarioService.crear(dto), "Horario creado");
    }

    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<HorarioResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(horarioService.listarPorTaller(idTaller), "Horarios del taller obtenidos");
    }

    @PutMapping("/{id}")
    public ApiResponse<HorarioResponseDTO> actualizar(@PathVariable Long id, @RequestBody HorarioRequestDTO dto) {
        return ApiResponse.success(horarioService.actualizar(id, dto), "Horario actualizado");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        horarioService.eliminar(id);
        return ApiResponse.success(null, "Horario eliminado");
    }
}