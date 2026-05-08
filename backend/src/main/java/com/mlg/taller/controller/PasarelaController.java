package com.mlg.taller.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.dtos.PagoSimuladoRequestDTO;
import com.mlg.taller.service.InscripcionService;
import com.mlg.taller.util.ApiResponse;
import lombok.RequiredArgsConstructor;

/**
 * Controlador para la gestión de pagos y transacciones económicas del sistema.
 * Actúa como un puente de seguridad (pasarela) que valida los datos bancarios 
 * antes de confirmar formalmente la matrícula de un alumno en un taller.
 */
@RestController
@RequestMapping("/api/pasarela")
@RequiredArgsConstructor
public class PasarelaController {

    private final InscripcionService inscripcionService;

    // --- MÉTODOS POST ---

    /**
     * Procesa un pago simulado y, tras su validación, registra la inscripción.
     * Incluye una simulación de latencia de red y reglas de negocio para 
     * verificar fondos y códigos de seguridad de la tarjeta.
     * * @param pagoDTO Objeto con la información bancaria y los datos de la matrícula.
     * @return ApiResponse con la inscripción confirmada y el OrderId generado.
     * @throws BadRequestException Si los datos bancarios son inválidos o insuficientes.
     */
    @PostMapping("/procesar")
    public ApiResponse<InscripcionResponseDTO> procesarPago(@RequestBody PagoSimuladoRequestDTO pagoDTO) {
        
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (pagoDTO.getNumeroTarjeta().startsWith("4444")) {
            throw new BadRequestException("Tarjeta denegada: Fondos insuficientes para completar la operación.");
        }

        if (pagoDTO.getCvv().equals("999")) {
            throw new BadRequestException("Error de seguridad: El código CVV proporcionado es incorrecto.");
        }

        String mockOrderId = "MOCK-PAY-" + System.currentTimeMillis();
        pagoDTO.getInscripcionInfo().setOrderId(mockOrderId);

        InscripcionResponseDTO response = inscripcionService.inscribir(pagoDTO.getInscripcionInfo());

        return ApiResponse.success(response, "Pago procesado correctamente y matrícula confirmada");
    }
}