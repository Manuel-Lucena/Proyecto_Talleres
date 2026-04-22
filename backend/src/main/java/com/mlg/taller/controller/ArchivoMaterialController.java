package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.service.ArchivoMaterialService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador para la gestión de archivos asociados a los materiales
 * didácticos.
 * Permite a los instructores administrar recursos de apoyo (subida, consulta,
 * actualización y eliminación) vinculados a los materiales del taller.
 */
@RestController
@RequestMapping("/api/archivos-material")
@RequiredArgsConstructor
public class ArchivoMaterialController {

    private final ArchivoMaterialService archivoMaterialService;

    // --- MÉTODOS POST ---

    /**
     * Sube un nuevo archivo físico y lo vincula a un material didáctico.
     * Utiliza el formato multipart para separar los metadatos del binario.
     * * @param dto Objeto con la información descriptiva del archivo.
     * 
     * @param file El archivo binario enviado mediante multipart/form-data.
     * @return ApiResponse con el detalle del archivo guardado.
     */
    @PostMapping(consumes = { "multipart/form-data" })
    public ApiResponse<ArchivoMaterialResponseDTO> guardar(
            @RequestPart("datos") ArchivoMaterialRequestDTO dto,
            @RequestPart("archivo") MultipartFile file) {
        return ApiResponse.success(archivoMaterialService.guardar(dto, file), "Archivo de material guardado");
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene la información detallada de un archivo específico por su ID.
     * * @param id Identificador único del archivo.
     * 
     * @return ApiResponse con el DTO del archivo.
     */
    @GetMapping("/{id}")
    public ApiResponse<ArchivoMaterialResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(archivoMaterialService.buscarPorId(id), "Archivo encontrado");
    }

    /**
     * Obtiene la lista de todos los archivos vinculados a un material concreto.
     * * @param idMaterial Identificador único del material padre.
     * 
     * @return ApiResponse con el listado de archivos de apoyo encontrados.
     */
    @GetMapping("/material/{idMaterial}")
    public ApiResponse<List<ArchivoMaterialResponseDTO>> listarPorMaterial(@PathVariable Long idMaterial) {
        return ApiResponse.success(archivoMaterialService.listarPorMaterial(idMaterial), "Archivos obtenidos");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma definitiva un archivo del sistema (tanto en base de datos
     * como en disco).
     * * @param id Identificador único del archivo a eliminar.
     * 
     * @return ApiResponse confirmando la eliminación exitosa.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoMaterialService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado");
    }
}