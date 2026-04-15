package com.mlg.taller.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Para logs profesionales

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Envía un correo a uno o varios destinatarios.
     * * @param to Un String (un correo) o String[] (varios correos)
     * 
     * @param subject      Asunto
     * @param templateName Nombre del HTML en templates/
     * @param variables    Mapa con objetos (pueden ser Entidades, Strings, etc.)
     */
    public void enviarCorreo(String[] to, String subject, String templateName, Map<String, Object> variables) {
        try {
            // 1. Preparamos el contexto de Thymeleaf
            Context context = new Context();
            if (variables != null) {
                context.setVariables(variables);
            }

            // 2. Renderizamos el HTML
            String htmlContent = templateEngine.process(templateName, context);

            // 3. Configuramos el MimeMessage
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to); // Spring ya gestiona si es uno o varios
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // 4. Enviar
            mailSender.send(message);
            log.info("Email enviado con éxito a: {}", (Object) to);

        } catch (MessagingException e) {
            log.error("Error crítico al configurar el email para {}: {}", to, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo", e);
        }
    }

    /**
     * Envía un correo con un archivo PDF adjunto.
     * Útil para enviar facturas o justificantes en el momento de la inscripción.
     * * @param to Email del destinatario
     * 
     * @param subject      Asunto del correo
     * @param templateName Nombre de la plantilla HTML para el cuerpo del mensaje
     * @param variables    Variables para personalizar el cuerpo del mensaje
     * @param pdfBytes     El contenido del PDF en un array de bytes
     * @param fileName     El nombre que tendrá el archivo adjunto (ej:
     *                     "Factura.pdf")
     */
    public void enviarCorreoConAdjunto(String to, String subject, String templateName,
            Map<String, Object> variables, byte[] pdfBytes, String fileName) {
        try {
            Context context = new Context();
            if (variables != null)
                context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            // El parámetro 'true' indica que el mensaje es MULTIPART (permite adjuntos)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            // En EmailService.java, dentro de enviarCorreoConAdjunto
            if (pdfBytes != null && pdfBytes.length > 0) {
                // Usamos el constructor que permite especificar el MimeType (application/pdf)
                helper.addAttachment(fileName, new ByteArrayResource(pdfBytes), "application/pdf");
            }

            mailSender.send(message);
            log.info("Email con factura enviado con éxito a: {}", to);

        } catch (MessagingException e) {
            log.error("Error al enviar email con adjunto a {}: {}", to, e.getMessage());
            throw new RuntimeException("Error enviando email con factura", e);
        }
    }

    /**
     * Sobrecarga para enviar a un solo destinatario de forma más cómoda (String en
     * lugar de Array)
     */
    public void enviarCorreo(String to, String subject, String templateName, Map<String, Object> variables) {
        enviarCorreo(new String[] { to }, subject, templateName, variables);
    }
}