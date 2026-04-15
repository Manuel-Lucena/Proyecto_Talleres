package com.mlg.taller.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Servicio encargado de la gestión y envío de correos electrónicos.
 * Permite el envío de mensajes simples y correos con archivos adjuntos
 * utilizando plantillas de Thymeleaf para el cuerpo del mensaje.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Envía un correo electrónico que incluye un archivo adjunto (típicamente un PDF).
     *
     * @param to           Dirección de correo del destinatario.
     * @param subject      Asunto del mensaje.
     * @param templateName Ruta de la plantilla HTML (relativa a templates/).
     * @param variables    Mapa con los datos que se inyectarán en la plantilla.
     * @param pdfBytes     Contenido binario del archivo a adjuntar.
     * @param fileName     Nombre que se le asignará al archivo en el correo (ej: factura.pdf).
     */
    @SneakyThrows(MessagingException.class)
    public void enviarCorreoConAdjunto(String to, String subject, String templateName,
                                       Map<String, Object> variables, byte[] pdfBytes, String fileName) {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(renderTemplate(templateName, variables), true);

        if (pdfBytes != null && pdfBytes.length > 0) {
            helper.addAttachment(fileName, new ByteArrayResource(pdfBytes), "application/pdf");
        }

        mailSender.send(message);
        log.info("Email con adjunto enviado correctamente a: {}", to);
    }

    /**
     * Envía un correo electrónico estándar en formato HTML.
     *
     * @param to           Dirección de correo del destinatario.
     * @param subject      Asunto del mensaje.
     * @param templateName Ruta de la plantilla HTML (relativa a templates/).
     * @param variables    Mapa con los datos para la plantilla.
     */
    @SneakyThrows(MessagingException.class)
    public void enviarCorreo(String to, String subject, String templateName, Map<String, Object> variables) {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(renderTemplate(templateName, variables), true);

        mailSender.send(message);
        log.info("Email enviado correctamente a: {}", to);
    }

    /**
     * Procesa la plantilla HTML de Thymeleaf con las variables proporcionadas.
     *
     * @param templateName Nombre de la plantilla.
     * @param variables    Datos para el contexto.
     * @return El contenido HTML renderizado como String.
     */
    private String renderTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            context.setVariables(variables);
        }
        return templateEngine.process(templateName, context);
    }
}