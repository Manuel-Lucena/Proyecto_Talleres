package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.service.InscripcionService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
public class InscripcionController {

    private final InscripcionService inscripcionService;

    // 1. GET - Listar todas (Vista Admin)
    @GetMapping
    public ApiResponse<List<InscripcionResponseDTO>> listarTodas() {
        return ApiResponse.success(inscripcionService.listarTodas(), "Listado de inscripciones obtenido");
    }

    // 2. GET - Buscar una por ID
    @GetMapping("/{id}")
    public ApiResponse<InscripcionResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(inscripcionService.buscarPorId(id), "Inscripción encontrada");
    }

    // 3. GET - Listar por Usuario (Vista Alumno: "Mis Talleres")
    @GetMapping("/usuario/{idUsuario}")
    public ApiResponse<List<InscripcionResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ApiResponse.success(inscripcionService.listarPorUsuario(idUsuario), "Inscripciones del usuario obtenidas");
    }

    // 4. POST - Crear inscripción (Apuntarse)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InscripcionResponseDTO> inscribir(@Valid @RequestBody InscripcionRequestDTO dto) {
        return ApiResponse.success(inscripcionService.inscribir(dto), "Inscripción realizada con éxito");
    }

    // 5. PUT - Actualizar (Para corregir pagos u otros datos)
    @PutMapping("/{id}")
    public ApiResponse<InscripcionResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody InscripcionRequestDTO dto) {
        return ApiResponse.success(inscripcionService.actualizar(id, dto), "Inscripción actualizada");
    }

    // 6. DELETE - Eliminar (Borrado lógico)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        inscripcionService.eliminar(id);
        return ApiResponse.success(null, "Inscripción eliminada correctamente");
    }
}