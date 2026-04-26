package com.mlg.taller.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Servicio encargado de la gestión y envío de correos electrónicos.
 * 
 * Este servicio utiliza Thymeleaf para el renderizado de plantillas HTML y 
 * JavaMailSender para la transmisión. Está diseñado para ser no bloqueante 
 * mediante el uso de ejecución asíncrona.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Envía un correo electrónico con un archivo adjunto de forma asíncrona.
     * 
     * Se captura la excepción MessagingException internamente y se relanza como 
     * RuntimeException para evitar ensuciar la firma de los métodos en la capa de negocio.
     *
     * @param to           Dirección de correo del destinatario.
     * @param subject      Asunto del mensaje.
     * @param templateName Nombre de la plantilla (ubicada en resources/templates/).
     * @param variables    Datos para inyectar en la plantilla.
     * @param pdfBytes     Contenido binario del archivo adjunto.
     * @param fileName     Nombre visible del archivo adjunto.
     */
    @Async
    public void enviarCorreoConAdjunto(String to, String subject, String templateName, 
                                       Map<String, Object> variables, byte[] pdfBytes, String fileName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(renderTemplate(templateName, variables), true);

            if (pdfBytes != null && pdfBytes.length > 0) {
                helper.addAttachment(fileName, new ByteArrayResource(pdfBytes), "application/pdf");
            }

            mailSender.send(message);
            log.info("Email con adjunto enviado con éxito a: {}", to);
            
        } catch (MessagingException e) {
            log.error("Error al construir el email para {}: {}", to, e.getMessage());
            throw new RuntimeException("Error técnico en el servicio de correo", e);
        }
    }

    /**
     * Envía un correo electrónico estándar en formato HTML de forma asíncrona.
     *
     * @param to           Dirección de correo del destinatario.
     * @param subject      Asunto del mensaje.
     * @param templateName Nombre de la plantilla.
     * @param variables    Datos para la plantilla.
     */
    @Async
    public void enviarCorreo(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(renderTemplate(templateName, variables), true);

            mailSender.send(message);
            log.info("Email enviado con éxito a: {}", to);
            
        } catch (MessagingException e) {
            log.error("Error al enviar el email a {}: {}", to, e.getMessage());
            throw new RuntimeException("Error técnico en el servicio de correo", e);
        }
    }

    /**
     * Renderiza la plantilla HTML usando el motor de Thymeleaf.
     */
    private String renderTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            context.setVariables(variables);
        }
        return templateEngine.process(templateName, context);
    }
}