package com.mlg.taller.service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.Map;

/**
 * Servicio encargado de la generación de documentos PDF a partir de plantillas HTML.
 * 
 * Este servicio utiliza el motor de plantillas Thymeleaf para la inyección de datos 
 * y la librería Flying Saucer (ITextRenderer) para la conversión a formato PDF.
 * Está optimizado para ser utilizado tanto en descargas directas como en adjuntos de correo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PdfService {

    private final TemplateEngine templateEngine;

    /**
     * Genera un documento PDF y lo escribe directamente en el flujo de respuesta HTTP.
     * 
     * Este método configura automáticamente el Content-Type como 'application/pdf'.
     * Utiliza @SneakyThrows para gestionar las excepciones de E/S de forma transparente.
     *
     * @param templateName Nombre de la plantilla HTML (ubicada en resources/templates/pdf/).
     * @param data         Mapa de objetos y datos que se inyectarán en la plantilla.
     * @param response     Objeto HttpServletResponse donde se escribirá el PDF resultante.
     */
    @SneakyThrows
    public void generarPdf(String templateName, Map<String, Object> data, HttpServletResponse response) {
        response.setContentType("application/pdf");
        escribirPdfEnStream(templateName, data, response.getOutputStream());
        log.info("PDF generado y enviado exitosamente a la respuesta HTTP.");
    }

    /**
     * Genera un documento PDF y devuelve su contenido como un array de bytes.
     * 
     * Es la opción ideal para procesos que requieren manipular el archivo antes de enviarlo,
     * como el envío de facturas o comprobantes adjuntos en correos electrónicos.
     *
     * @param templateName Nombre de la plantilla HTML (ubicada en resources/templates/pdf/).
     * @param data         Mapa de objetos y datos para la plantilla.
     * @return byte[]      Representación binaria del documento PDF generado.
     */
    @SneakyThrows
    public byte[] generarBytesPdf(String templateName, Map<String, Object> data) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            escribirPdfEnStream(templateName, data, outputStream);
            log.info("PDF convertido a array de bytes correctamente.");
            return outputStream.toByteArray();
        }
    }

    /**
     * Lógica interna para el renderizado de HTML y conversión a PDF.
     * 
     * Realiza el proceso en tres etapas:
     * 1. Preparación del contexto de Thymeleaf.
     * 2. Renderizado del HTML a partir de la plantilla.
     * 3. Generación del PDF mediante el motor ITextRenderer.
     *
     * @param templateName Nombre de la plantilla.
     * @param data         Datos para el contexto.
     * @param outputStream Flujo de salida donde se escribirá el PDF.
     */
    @SneakyThrows
    private void escribirPdfEnStream(String templateName, Map<String, Object> data, OutputStream outputStream) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }

    
        String htmlContent = templateEngine.process("pdf/" + templateName, context);


        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(htmlContent);
        renderer.layout();
        renderer.createPDF(outputStream);
        outputStream.flush();
        
        log.debug("Procesamiento de PDF '{}' completado con éxito.", templateName);
    }
}