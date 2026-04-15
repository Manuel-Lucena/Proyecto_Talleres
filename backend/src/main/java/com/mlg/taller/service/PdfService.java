package com.mlg.taller.service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream; // Nuevo import
import java.io.OutputStream;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final TemplateEngine templateEngine;

    /**
     * Genera un PDF y lo envía directamente al navegador del usuario.
     * Ideal para descargas manuales desde la interfaz.
     * * @param templateName Nombre del archivo .html en resources/templates/pdf/
     * 
     * @param data     Mapa con los objetos para Thymeleaf
     * @param response El objeto response del controlador
     */
    public void generarPdf(String templateName, Map<String, Object> data, HttpServletResponse response) {
        try {
            response.setContentType("application/pdf");
            OutputStream outputStream = response.getOutputStream();

            // Reutilizamos la lógica de generación pasándole el stream de la respuesta
            escribirPdfEnStream(templateName, data, outputStream);

            outputStream.flush();
            outputStream.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF para descarga: " + e.getMessage());
        }
    }

    /**
     * Genera un PDF y devuelve su contenido como un array de bytes.
     * Ideal para adjuntar en correos electrónicos.
     * * @param templateName Nombre del archivo .html en resources/templates/pdf/
     * 
     * @param data Mapa con los objetos para Thymeleaf
     * @return byte[] El contenido binario del PDF
     */
    public byte[] generarBytesPdf(String templateName, Map<String, Object> data) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            escribirPdfEnStream(templateName, data, outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar los bytes del PDF: " + e.getMessage());
        }
    }

    /**
     * Método privado auxiliar para evitar repetir código.
     * Se encarga de la lógica común de renderizado.
     */
    private void escribirPdfEnStream(String templateName, Map<String, Object> data, OutputStream outputStream)
            throws Exception {
        Context context = new Context();
        context.setVariables(data);

        String htmlContent = templateEngine.process("pdf/" + templateName, context);

        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(htmlContent);
        renderer.layout();
        renderer.createPDF(outputStream);

        // AÑADE ESTO PARA ASEGURAR EL VOLCADO
        outputStream.flush();
    }
}