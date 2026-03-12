package com.mlg.taller.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Component
public class FileUtil {

    public void guardar(MultipartFile archivo, String subCarpeta, String nombre) {
        try {
            // Si la ejecución es en Proyecto_Talleres, entramos directo a frontend
            // ./ significa "donde estoy parado ahora"
            Path rootPath = Paths.get(".", "frontend", "public", subCarpeta)
                    .toAbsolutePath()
                    .normalize();

            System.out.println("----------------------------------------------");
            System.out.println("FORZANDO RUTA A MANO: " + rootPath);
            System.out.println("----------------------------------------------");

            if (!Files.exists(rootPath)) {
                Files.createDirectories(rootPath);
            }

            Path destino = rootPath.resolve(nombre);
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("¡HECHO! Mira en: " + destino);

        } catch (IOException e) {
            throw new RuntimeException("Error manual: " + e.getMessage());
        }
    }

    public void eliminar(String subCarpeta, String nombre) {
        try {
            Path ruta = Paths.get(".", "frontend", "public", subCarpeta, nombre)
                    .toAbsolutePath()
                    .normalize();
            Files.deleteIfExists(ruta);
        } catch (IOException e) {
            System.err.println("Error al borrar: " + e.getMessage());
        }
    }
}