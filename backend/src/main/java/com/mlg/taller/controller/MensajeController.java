package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.service.MensajeService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de la mensajería y comunicación dentro de los
 * talleres.
 * Permite el envío de mensajes, la consulta de historiales por taller y la
 * moderación de los mismos.
 */
@RestController
@RequestMapping("/api/mensajes")
@RequiredArgsConstructor
public class MensajeController {

    private final MensajeService mensajeService;

    // --- MÉTODOS POST ---

    /**
     * Registra y envía un nuevo mensaje en el sistema.
     * 
     * @param dto Objeto con el contenido del mensaje, emisor y taller de destino.
     * @return ApiResponse con los datos del mensaje enviado.
     */
    @PostMapping
    public ApiResponse<MensajeResponseDTO> enviar(@RequestBody MensajeRequestDTO dto) {
        return ApiResponse.success(mensajeService.enviar(dto), "Mensaje enviado correctamente");
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera el historial de mensajes asociados a un taller específico.
     * * @param idTaller Identificador único del taller.
     * 
     * @return ApiResponse con la lista de mensajes del taller solicitado.
     */
    @GetMapping("/taller/{idTaller}")
    public ApiResponse<List<MensajeResponseDTO>> listarPorTaller(@PathVariable Long idTaller) {
        return ApiResponse.success(mensajeService.listarPorTaller(idTaller), "Historial obtenido");
    }

    /**
     * Obtiene el listado global de todos los mensajes registrados en la plataforma.
     * * @return ApiResponse con la lista completa de mensajes.
     */
    @GetMapping
    public ApiResponse<List<MensajeResponseDTO>> listarTodos() {
        return ApiResponse.success(mensajeService.listarTodos(), "Todos los mensajes obtenidos");
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma definitiva un mensaje mediante su identificador.
     * 
     * @param id Identificador único del mensaje a suprimir.
     * @return ApiResponse confirmando la eliminación del registro.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        mensajeService.eliminar(id);
        return ApiResponse.success(null, "Mensaje eliminado");
    }
}