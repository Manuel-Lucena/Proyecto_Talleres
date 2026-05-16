package com.mlg.taller.security.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Value("${app.storage.public-path}")
    private String publicPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        /* Mapeamos las rutas de URL a las carpetas físicas en el PVC (/app/data/public/...)
           El prefijo 'file:' es obligatorio para que busque fuera del JAR 
        */
        registry.addResourceHandler("/usuarios/**")
                .addResourceLocations("file:" + publicPath + "/usuarios/");
        
        registry.addResourceHandler("/noticias/**")
                .addResourceLocations("file:" + publicPath + "/noticias/");
        
        registry.addResourceHandler("/talleres/**")
                .addResourceLocations("file:" + publicPath + "/talleres/");
    }
}