package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.service.ArchivoTareaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador para la gestión de archivos adjuntos a las tareas.
 * Permite administrar los recursos informativos o enunciados que los profesores 
 * vinculan a las tareas creadas en el taller.
 */
@RestController
@RequestMapping("/api/archivos-tarea")
@RequiredArgsConstructor
public class ArchivoTareaController {

    private final ArchivoTareaService archivoTareaService;

    // --- MÉTODOS POST ---

    /**
     * Registra un nuevo archivo físico vinculándolo a una tarea existente.
     * El proceso es multipart: recibe un JSON con datos y el binario del archivo.
     * * @param dto  Metadatos del archivo (validado mediante @Valid).
     * @param file El recurso físico (MultipartFile) a almacenar.
     * @return     ApiResponse con el archivo registrado y estado HTTP 201 (Created).
     */
    @PostMapping(consumes = { "multipart/form-data" })
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArchivoTareaResponseDTO> guardar(
            @RequestPart("datos") @Valid ArchivoTareaRequestDTO dto,
            @RequestPart("archivo") MultipartFile file) {
        return ApiResponse.success(archivoTareaService.guardar(dto, file), "Archivo registrado correctamente");
    }

    // --- MÉTODOS GET ---

    /**
     * Busca la información de un archivo específico mediante su identificador único.
     * * @param id Identificador único del registro del archivo en base de datos.
     * @return   ApiResponse con los metadatos del archivo encontrado.
     */
    @GetMapping("/{id}")
    public ApiResponse<ArchivoTareaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(archivoTareaService.buscarPorId(id), "Archivo encontrado");
    }

    /**
     * Lista todos los archivos asociados a una tarea concreta.
     * Permite obtener los adjuntos o enunciados de una actividad específica.
     * * @param idTarea Identificador de la tarea de la cual se requieren los adjuntos.
     * @return        ApiResponse con la lista de archivos vinculados a la tarea.
     */
    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<ArchivoTareaResponseDTO>> listarPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(archivoTareaService.listarPorTarea(idTarea), "Archivos de la tarea obtenidos");
    }


    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma lógica y física un archivo de tarea del servidor y la base de datos.
     * * @param id Identificador único del archivo a suprimir.
     * @return   ApiResponse confirmando la eliminación del recurso.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        archivoTareaService.eliminar(id);
        return ApiResponse.success(null, "Archivo eliminado correctamente");
    }
}