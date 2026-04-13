package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.service.ArchivoEntregaService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador para la gestión de archivos asociados a las entregas de los alumnos.
 * Permite la administración (subida, consulta y eliminación) de las evidencias 
 * físicas o documentos que los alumnos adjuntan a sus trabajos.
 */
@RestController
@RequestMapping("/api/archivos-entrega")
@RequiredArgsConstructor
public class ArchivoEntregaController {

    private final ArchivoEntregaService archivoEntregaService;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo archivo vinculado a una entrega específica.
     * Utiliza formato multipart para procesar simultáneamente los metadatos y el binario.
     * * @param dto  Objeto con la información asociada (id de la entrega, descripción, etc.).
     * @param file El archivo físico (documento, imagen, etc.) enviado por el alumno.
     * @return     ApiResponse con el detalle del archivo guardado y su identificador.
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<ArchivoEntregaResponseDTO> guardar(
            @RequestPart("datos") ArchivoEntregaRequestDTO dto,
            @RequestPart("archivo") MultipartFile file) {
        return ApiResponse.success(archivoEntregaService.guardar(dto, file), "Archivo de entrega guardado");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el listado de todos los archivos adjuntos a una entrega específica.
     * * @param idEntrega Identificador único de la entrega de la cual se quieren obtener los archivos.
     * @return          ApiResponse conteniendo la lista de archivos encontrados para dicha entrega.
     */
    @GetMapping("/entrega/{idEntrega}")
    public ApiResponse<List<ArchivoEntregaResponseDTO>> listarPorEntrega(@PathVariable Long idEntrega) {
        return ApiResponse.success(archivoEntregaService.listarPorEntrega(idEntrega), "Archivos obtenidos");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un registro de archivo del sistema de forma lógica y física (disco duro).
     * * @param id Identificador único del registro de archivo a eliminar.
     * @return   ApiResponse confirmando el éxito de la operación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoEntregaService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado");
    }
}