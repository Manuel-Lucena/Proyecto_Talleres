package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.service.EntregaService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de las entregas de tareas por parte de los
 * alumnos.
 * Centraliza la recepción de trabajos, la consulta de estados y el proceso de
 * calificación por parte de los instructores.
 */
@RestController
@RequestMapping("/api/entregas")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva entrega de trabajo en el sistema.
     * * @param dto Objeto con la información de la entrega enviada por el alumno
     * (validado mediante @Valid).
     * 
     * @return ApiResponse con los datos de la entrega registrada y estado HTTP 201.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EntregaResponseDTO> enviar(@Valid @RequestBody EntregaRequestDTO dto) {
        return ApiResponse.success(entregaService.enviar(dto), "Trabajo entregado correctamente");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el listado global de todas las entregas realizadas en el taller.
     * * @return ApiResponse con la lista completa de entregas registradas.
     */
    @GetMapping
    public ApiResponse<List<EntregaResponseDTO>> listarTodas() {
        return ApiResponse.success(entregaService.listarTodas(), "Listado de entregas obtenido");
    }

    /**
     * Busca una entrega específica mediante su identificador único.
     * * @param id Identificador de la entrega a buscar.
     * 
     * @return ApiResponse con la información de la entrega encontrada.
     */
    @GetMapping("/{id}")
    public ApiResponse<EntregaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ApiResponse.success(entregaService.buscarPorId(id), "Entrega encontrada");
    }

    /**
     * Obtiene el listado de entregas asociadas a una tarea específica.
     * * @param idTarea Identificador de la tarea de la cual se desean obtener las
     * entregas.
     * 
     * @return ApiResponse con la lista de entregas filtradas por tarea.
     */
    @GetMapping("/tarea/{idTarea}")
    public ApiResponse<List<EntregaResponseDTO>> listarPorTarea(@PathVariable Long idTarea) {
        return ApiResponse.success(entregaService.listarPorTarea(idTarea), "Entregas de la tarea obtenidas");
    }

    /**
     * Recupera la entrega realizada por el usuario  para una
     * tarea específica.
     * * @param idTarea Identificador de la tarea a consultar.
     * 
     * @return ApiResponse con la entrega del alumno o null si aún no ha realizado
     *         el envío.
     */
    @GetMapping("/tarea/{idTarea}/mi-entrega")
    public ApiResponse<EntregaResponseDTO> obtenerMiEntrega(@PathVariable Long idTarea) {
        return ApiResponse.success(entregaService.obtenerEntregaUsuario(idTarea),
                "Tu entrega ha sido recuperada");
    }

    /**
     * Obtiene todas las entregas de un alumno para las tareas de un taller
     * específico.
     * Utilizado para la vista de "Expediente del Alumno" en el panel del profesor.
     * * @param idAlumno Identificador del alumno.
     * 
     * @param idTaller Identificador del taller.
     * @return ApiResponse con el listado de entregas del expediente.
     */
    @GetMapping("/alumno/{idAlumno}/taller/{idTaller}")
    public ApiResponse<List<EntregaResponseDTO>> listarPorAlumnoYTaller(
            @PathVariable Long idAlumno,
            @PathVariable Long idTaller) {
        return ApiResponse.success(
                entregaService.listarPorAlumnoYTaller(idAlumno, idTaller),
                "Expediente del alumno obtenido correctamente");
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información general de una entrega existente.
     * * @param id Identificador de la entrega a modificar.
     * 
     * @param dto Objeto con los nuevos datos de la entrega.
     * @return ApiResponse con los datos de la entrega tras la actualización.
     */
    @PutMapping("/{id}")
    public ApiResponse<EntregaResponseDTO> actualizar(@PathVariable Long id, @RequestBody EntregaRequestDTO dto) {
        return ApiResponse.success(entregaService.actualizar(id, dto), "Entrega actualizada correctamente");
    }

    /**
     * Procesa la calificación y el feedback de una entrega por parte del profesor.
     * Se utiliza PUT para garantizar la consistencia en la actualización de la nota
     * y comentarios.
     * * @param id Identificador de la entrega a calificar.
     * 
     * @param dto Datos que contienen la nota y la retroalimentación del instructor.
     * @return ApiResponse con la entrega actualizada con su nueva calificación.
     */
    @PutMapping("/{id}/calificar")
    public ApiResponse<EntregaResponseDTO> calificar(@PathVariable Long id, @RequestBody EntregaRequestDTO dto) {
        return ApiResponse.success(entregaService.calificar(id, dto), "Calificación registrada");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma definitiva una entrega del sistema.
     * * @param id Identificador de la entrega que se desea eliminar.
     * 
     * @return ApiResponse confirmando el éxito de la eliminación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        entregaService.eliminar(id);
        return ApiResponse.success(null, "Entrega eliminada correctamente");
    }
}