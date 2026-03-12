package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.service.TallerService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/talleres")
@RequiredArgsConstructor
public class TallerController {

    private final TallerService tallerService;

    // Listar todos (Devuelve una lista de ResponseDTO)
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<List<TallerResponseDTO>> listarTodos() {
        return ApiResponse.success(tallerService.listarTodos(), "Lista de talleres obtenida");
    }

    // Obtener uno por ID (Devuelve un ResponseDTO)
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<TallerResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(tallerService.buscarPorId(id), "Detalle del taller");
    }

    // Crear (Recibe RequestDTO, devuelve ResponseDTO)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TallerResponseDTO> crear(@Valid @RequestBody TallerRequestDTO request) {
        return ApiResponse.success(tallerService.crear(request), "Taller creado con éxito");
    }

    // Actualizar (Recibe RequestDTO, devuelve ResponseDTO)
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<TallerResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody TallerRequestDTO request) {
        // Nota: He asumido que crearás el método 'actualizar' en el Service
        return ApiResponse.success(tallerService.actualizar(id, request), "Taller actualizado correctamente");
    }

    // Eliminar
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        tallerService.eliminar(id);
        return ApiResponse.success(null, "Taller eliminado correctamente");
    }
}