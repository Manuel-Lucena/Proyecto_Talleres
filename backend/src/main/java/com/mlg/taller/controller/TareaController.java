package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.service.TareaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de tareas dentro de los talleres.
 * Permite a los instructores asignar actividades, definir fechas de entrega
 * y organizar el flujo evaluativo de cada taller.
 */
@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor

public class TareaController {

    private final TareaService tareaService;

    // --- MÉTODOS POST ---

    /**
     * Crea una nueva tarea vinculada a un taller específico.
     * 
     * @param dto Datos de la tarea (título, descripción, fecha límite, taller ID).
     * @return ApiResponse con la tarea creada y estado HTTP 201.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TareaResponseDTO> crear(@Valid @RequestBody TareaRequestDTO dto) {
        return ApiResponse.success(tareaService.crear(dto), "Tarea creada con éxito");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el listado global de todas las tareas registradas.
     * * @return ApiResponse con la lista completa de tareas.
     */
    @GetMapping
    public ApiResponse<List<TareaResponseDTO>> listar() {
        return ApiResponse.success(tareaService.listarTodas(), "Tareas obtenidas");
    }

    /**
     * Obtiene todas las tareas pertenecientes a un taller concreto.
     * * @param idTaller Identificador único del taller.
     * 
     * @return ApiResponse con la lista de tareas de dicho taller.
     */
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<TareaResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(tareaService.listarPorTaller(idTaller), "Tareas del taller obtenidas");
    }

    /**
     * [ALUMNO] Obtiene el listado de tareas personalizadas según el nivel del
     * alumno.
     * * @param idTaller Identificador único del taller.
     * 
     * @return ApiResponse con la lista de tareas visibles y asignadas para su
     *         nivel.
     */
    @GetMapping("/taller/{idTaller}/visibles")
    public ApiResponse<List<TareaResponseDTO>> listarVisibles(@PathVariable Long idTaller) {
        return ApiResponse.success(tareaService.listarVisibles(idTaller), "Tareas obtenidas con éxito");
    }

    /**
     * Busca la información detallada de una tarea por su identificador.
     * * @param id Identificador único de la tarea.
     * @return ApiResponse con la tarea encontrada.
     */
    @GetMapping("/{id}")
    public ApiResponse<TareaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(tareaService.obtenerPorId(id), "Tarea obtenida con éxito");
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de una tarea existente.
     * 
     * @param id  Identificador de la tarea a modificar.
     * @param dto Nuevos datos para la tarea (validado mediante @Valid).
     * @return ApiResponse con la tarea actualizada.
     */
    @PutMapping("/{id}")
    public ApiResponse<TareaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody TareaRequestDTO dto) {
        return ApiResponse.success(tareaService.actualizar(id, dto), "Tarea actualizada correctamente");
    }

    /**
     * Alterna el estado de visibilidad de una tarea.
     * 
     * @param id Identificador de la tarea.
     * @return ApiResponse con la tarea actualizada.
     */
    @PutMapping("/{id}/visibilidad")
    public ApiResponse<TareaResponseDTO> cambiarVisibilidad(@PathVariable Long id) {
        return ApiResponse.success(tareaService.cambiarVisibilidad(id), "Visibilidad de la tarea actualizada");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una tarea del sistema.
     * 
     * @param id Identificador único de la tarea a suprimir.
     * @return ApiResponse confirmando la eliminación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        tareaService.eliminar(id);
        return ApiResponse.success(null, "Tarea eliminada correctamente");
    }
}