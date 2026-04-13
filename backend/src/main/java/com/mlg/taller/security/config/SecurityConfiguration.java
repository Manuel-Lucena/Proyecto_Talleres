package com.mlg.taller.security.config;

import com.mlg.taller.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. AÑADE ESTO: Activa CORS con la configuración que definimos abajo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 2. AÑADE ESTO: Permite todas las peticiones de tipo OPTIONS (Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =========================================================
                        // 1. ENTIDAD: USUARIOS & AUTH
                        // =========================================================

                        // Acceso Público (Registro y Login)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/register", "/api/usuarios/login").permitAll()

                        // Acceso exclusivo ADMIN (Gestión masiva y eliminación)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/batch").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                        // Acceso Autenticado (Listar, ver perfil, actualizar)
                        .requestMatchers("/api/usuarios/**").authenticated()

                        // =========================================================
                        // 2. ENTIDAD: TALLERES
                        // =========================================================

                        // Lectura: Cualquier usuario logueado puede ver el catálogo y sus talleres
                        .requestMatchers(HttpMethod.GET, "/api/talleres/**").authenticated()

                        // Escritura: Solo el ADMIN puede crear, modificar o eliminar talleres
                        .requestMatchers(HttpMethod.POST, "/api/talleres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/talleres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/talleres/**").hasRole("ADMIN")

                        // =========================================================
                        // 3. ENTIDAD: NOTICIAS
                        // =========================================================

                        // Lectura: Público (Cualquiera puede leer las noticias)
                        .requestMatchers(HttpMethod.GET, "/api/noticias/**").permitAll()

                        // Gestión: Solo ADMIN puede publicar, editar o borrar
                        .requestMatchers(HttpMethod.POST, "/api/noticias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/noticias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/noticias/**").hasRole("ADMIN")

                        // =========================================================
                        // 4. ENTIDAD: MENSAJES
                        // =========================================================

                        // Moderación y Auditoría: Solo ADMIN ve todo el historial global o elimina
                        .requestMatchers(HttpMethod.GET, "/api/mensajes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/mensajes/**").hasRole("ADMIN")

                        // Comunicación: Alumnos/Profesores pueden enviar y ver chats de sus talleres
                        .requestMatchers("/api/mensajes/**").authenticated()

                        // ... resto de tus rutas ...
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 3. AÑADE ESTE BEAN: Configuración detallada de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite el origen de tu Angular
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        // Permite los métodos que usas
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Importante: permite la cabecera Authorization (el Bearer token)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}