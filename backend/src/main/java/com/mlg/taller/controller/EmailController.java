package com.mlg.taller.controller;

import com.mlg.taller.service.EmailService;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Profile("dev")
public class EmailController {

    private final EmailService emailService;

    /**
     * Endpoint de prueba para verificar que el envío funciona.
     * URL: http://localhost:8080/api/email/test?destinatario=tu-correo@gmail.com
     */
    @GetMapping("/test")
    public String enviarPrueba(@RequestParam String destinatario) {
        
        Map<String, Object> datos = new HashMap<>();
        datos.put("nombre", "Usuario de Prueba");
        datos.put("rol", "ALUMNO");

        emailService.enviarCorreo(
            destinatario, 
            "Prueba de Conexión - Taller UP", 
            "email-bienvenida", 
            datos
        );

        return "Solicitud de envío procesada para: " + destinatario;
    }
}