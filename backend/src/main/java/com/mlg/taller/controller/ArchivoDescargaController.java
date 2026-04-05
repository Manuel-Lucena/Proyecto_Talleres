package com.mlg.taller.controller;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.service.ArchivoMaterialService;
import com.mlg.taller.service.ArchivoTareaService;
import com.mlg.taller.service.ArchivoEntregaService;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/descargas")
@RequiredArgsConstructor
public class ArchivoDescargaController {

    private final FileUtil fileUtil;
    private final ArchivoMaterialService archivoMaterialService;
    private final ArchivoTareaService archivoTareaService;
    private final ArchivoEntregaService archivoEntregaService;

    @GetMapping("/material/{id}")
    public ResponseEntity<Resource> descargarMaterial(@PathVariable Long id) {
        var dto = archivoMaterialService.buscarPorId(id);
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    @GetMapping("/tarea/{id}")
    public ResponseEntity<Resource> descargarTarea(@PathVariable Long id) {
        var dto = archivoTareaService.buscarPorId(id);
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    @GetMapping("/entrega/{id}")
    public ResponseEntity<Resource> descargarEntrega(@PathVariable Long id) {
        var dto = archivoEntregaService.buscarPorId(id); 
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    /**
     * @SneakyThrows es una anotación de Lombok que "engaña" al compilador 
     * para no escribir el try-catch de la MalformedURLException.
     * Si ocurre, llegará al handleGlobal de tu ExceptionHandler.
     */
    @SneakyThrows
    private ResponseEntity<Resource> servirArchivo(String rutaBd, String nombreOriginal) {
        
        String[] partes = rutaBd.split("/");
        if (partes.length < 2) {
            throw new BadRequestException("Ruta de archivo corrupta en base de datos");
        }

        Path path = fileUtil.getRutaProtegida(partes[0], partes[1]);
        Resource recurso = new UrlResource(path.toUri());

        // Si el archivo no existe físicamente, lanzamos TU excepción 404
        if (!recurso.exists() || !recurso.isReadable()) {
            throw new ResourceNotFoundException("El archivo '" + nombreOriginal + "' no existe en el servidor");
        }

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreOriginal + "\"")
            .body(recurso);
    }
}