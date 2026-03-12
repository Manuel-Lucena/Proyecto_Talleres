package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.NoticiaRequestDTO;
import com.mlg.taller.model.dtos.NoticiaResponseDTO;
import com.mlg.taller.service.NoticiaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NoticiaController {

    private final NoticiaService noticiaService;

    // 1. Listar todas las noticias
    @GetMapping
    public ApiResponse<List<NoticiaResponseDTO>> listar() {
        List<NoticiaResponseDTO> noticias = noticiaService.listarTodas();
        return ApiResponse.success(noticias, "Lista de noticias obtenida correctamente");
    }

    // 2. Obtener noticia por ID
    @GetMapping("/{id}")
    public ApiResponse<NoticiaResponseDTO> obtenerPorId(@PathVariable Long id) {
        NoticiaResponseDTO noticia = noticiaService.buscarPorId(id);
        return ApiResponse.success(noticia, "Noticia encontrada");
    }

    // 3. Crear noticia (Acepta imagen)
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NoticiaResponseDTO> crear(
            @RequestPart("noticia") @Valid NoticiaRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(noticiaService.crear(dto, archivo), "Noticia creada con éxito");
    }

    // 4. Actualizar noticia (Acepta imagen)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NoticiaResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestPart("noticia") @Valid NoticiaRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(noticiaService.actualizar(id, dto, archivo), "Noticia actualizada correctamente");
    }

    // 5. Eliminar noticia
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        noticiaService.eliminar(id);
        return ApiResponse.success(null, "Noticia eliminada correctamente");
    }
}