package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.TareaAsignadaResponseDTO;
import com.mlg.taller.service.TareaAsignadaService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de asignaciones individuales de tareas.
 * Permite a los instructores controlar la visibilidad selectiva de las
 * actividades,
 * vinculando tareas específicas a alumnos según su nivel o necesidades.
 */
@RestController
@RequestMapping("/api/tareas-asignadas")
@RequiredArgsConstructor
public class TareaAsignadaController {

    private final TareaAsignadaService tareaAsignadaService;

    // --- MÉTODOS GET ---

    /**
     * Recupera el listado de alumnos que tienen asignada una tarea concreta.
     * Útil para inicializar el estado de los selectores en el panel del profesor.
     * * @param idTarea Identificador único de la tarea.
     * 
     * @return ApiResponse con la lista de alumnos asignados.
     */
    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<TareaAsignadaResponseDTO>> obtenerAsignacionesPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(
                tareaAsignadaService.listarPorTarea(idTarea),
                "Asignaciones de la tarea recuperadas con éxito");
    }

    /**
     * Recupera el listado de tareas que un alumno tiene asignadas individualmente.
     * Permite generar el expediente de actividades personalizadas para un
     * estudiante.
     * * @param idAlumno Identificador único del alumno.
     * 
     * @return ApiResponse con la lista de tareas asignadas al alumno.
     */
    @GetMapping("/alumno/{idAlumno}")
    public ApiResponse<List<TareaAsignadaResponseDTO>> obtenerAsignacionesPorAlumno(@PathVariable Long idAlumno) {
        return ApiResponse.success(
                tareaAsignadaService.listarPorAlumno(idAlumno),
                "Expediente de tareas del alumno recuperado con éxito");
    }

    // --- MÉTODOS POST ---

    /**
     * Sincroniza de forma masiva los alumnos asignados a una actividad.
     * Este método reemplaza las asignaciones existentes por la nueva selección.
     * * @param idTarea Identificador de la tarea a gestionar.
     * 
     * @param alumnoIds Lista de IDs de los alumnos que tendrán acceso a la tarea.
     * @return ApiResponse confirmando la actualización de la visibilidad.
     */
    @PostMapping("/actualizar/{idTarea}")
    public ApiResponse<Void> actualizarAsignaciones(
            @PathVariable Long idTarea,
            @RequestBody List<Long> alumnoIds) {

        tareaAsignadaService.actualizarAsignaciones(idTarea, alumnoIds);
        return ApiResponse.success(null, "Visibilidad de la tarea actualizada correctamente");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina todas las asignaciones vinculadas a una tarea.
     * Se utiliza para revocar el acceso de todos los alumnos a una actividad.
     * * @param idTarea Identificador de la tarea.
     * 
     * @return ApiResponse confirmando la eliminación de registros.
     */
    @DeleteMapping("/tarea/{idTarea}")
    public ApiResponse<Void> eliminarAsignaciones(@PathVariable Long idTarea) {
        tareaAsignadaService.eliminarAsignacionesDeTarea(idTarea);
        return ApiResponse.success(null, "Se han revocado todas las asignaciones de la tarea");
    }
}