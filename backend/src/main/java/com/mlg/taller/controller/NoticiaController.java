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

/**
 * Controlador REST para la gestión del tablón de noticias y novedades.
 * Permite la publicación de contenido informativo con soporte para archivos multimedia.
 */
@RestController
@RequestMapping("/api/noticias")
@RequiredArgsConstructor
public class NoticiaController {

    private final NoticiaService noticiaService;

    // --- MÉTODOS POST ---

    /**
     * Publica una nueva noticia incluyendo opcionalmente una imagen de cabecera.
     * Se requiere el uso de multipart/form-data.
     * @param dto     Objeto JSON con el título, contenido y metadatos de la noticia.
     * @param archivo Imagen o recurso visual asociado a la noticia (opcional).
     * @return        ApiResponse con la noticia creada y su ruta de imagen asignada.
     */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NoticiaResponseDTO> crear(
            @RequestPart("noticia") @Valid NoticiaRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(noticiaService.crear(dto, archivo), "Noticia creada con éxito");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera todas las noticias activas registradas en el sistema.
     * @return ApiResponse conteniendo el listado de NoticiaResponseDTO.
     */
    @GetMapping
    public ApiResponse<List<NoticiaResponseDTO>> listar() {
        List<NoticiaResponseDTO> noticias = noticiaService.listarTodas();
        return ApiResponse.success(noticias, "Lista de noticias obtenida correctamente");
    }

    /**
     * Busca una noticia específica mediante su identificador único.
     * @param id Identificador único de la noticia.
     * @return   ApiResponse con los detalles de la noticia solicitada.
     */
    @GetMapping("/{id}")
    public ApiResponse<NoticiaResponseDTO> obtenerPorId(@PathVariable Long id) {
        NoticiaResponseDTO noticia = noticiaService.buscarPorId(id);
        return ApiResponse.success(noticia, "Noticia encontrada");
    }

    // --- MÉTODOS PUT ---

    /**
     * Modifica el contenido o la imagen de una noticia existente.
     * Si no se envía un nuevo archivo, se mantendrá la imagen actual.
     * @param id      Identificador de la noticia a modificar.
     * @param dto     Datos actualizados de la noticia.
     * @param archivo Nueva imagen de cabecera (opcional).
     * @return        ApiResponse con la noticia actualizada.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NoticiaResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestPart("noticia") @Valid NoticiaRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(noticiaService.actualizar(id, dto, archivo), "Noticia actualizada correctamente");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una noticia del sistema de forma física o lógica.
     * @param id Identificador de la noticia a borrar.
     * @return   ApiResponse indicando el éxito de la operación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        noticiaService.eliminar(id);
        return ApiResponse.success(null, "Noticia eliminada correctamente");
    }
}