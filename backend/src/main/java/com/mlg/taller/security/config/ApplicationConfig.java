package com.mlg.taller.security.config;

import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuración central de la infraestructura de seguridad de la aplicación.
 * Define los componentes necesarios para la autenticación y el cifrado de credenciales.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UsuarioRepository usuarioRepository;

    /**
     * Define la estrategia para localizar a los usuarios durante el login.
     * @return Una implementación de {@link UserDetailsService} que busca por email en la base de datos.
     * @throws UsernameNotFoundException Si el correo electrónico no existe en el sistema.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el email: " + username));
    }

    /**
     * Configura el proveedor de autenticación estándar de Spring Security.
     * Vincula el servicio de búsqueda de usuarios con el algoritmo de cifrado de contraseñas.
     * @return {@link AuthenticationProvider} configurado para validación contra base de datos (DAO).
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Expone el gestor de autenticación oficial de Spring.
     * Es el componente que procesa las solicitudes de login en los controladores o servicios.
     * @param config Configuración de autenticación inyectada por Spring.
     * @return {@link AuthenticationManager} para validar credenciales.
     * @throws Exception Si ocurre un error al recuperar el gestor.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Define el algoritmo de hashing para las contraseñas.
     * Utiliza BCrypt, un estándar de la industria que incluye 'salt' automático y es resistente a fuerza bruta.
     * @return Instancia de {@link BCryptPasswordEncoder}.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}