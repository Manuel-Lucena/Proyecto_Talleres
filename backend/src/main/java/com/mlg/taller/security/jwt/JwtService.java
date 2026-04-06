package com.mlg.taller.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.mlg.taller.model.entities.Usuario;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio encargado de la generación, extracción y validación de tokens JWT.
 * Utiliza algoritmos de cifrado HS256 para garantizar la integridad de la información.
 */
@Service
public class JwtService {

    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long JWT_EXPIRATION = 86400000; // 24 horas

    /**
     * Extrae el nombre de usuario (subject) contenido en el token.
     * @param token Token JWT del cual extraer la información.
     * @return Email del usuario contenido en el token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrae un fragmento específico de información (claim) del token.
     * @param <T> Tipo de dato esperado del claim.
     * @param token Token JWT.
     * @param claimsResolver Función para resolver el claim deseado.
     * @return El valor del claim extraído.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Genera un token JWT incluyendo el rol y el ID del usuario como claims adicionales.
     * @param userDetails Detalles del usuario autenticado.
     * @return Cadena de texto que representa el token JWT.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");
        extraClaims.put("role", role);

        if (userDetails instanceof Usuario) {
            extraClaims.put("id", ((Usuario) userDetails).getId());
        }

        return generateToken(extraClaims, userDetails);
    }

    /**
     * Construye el token JWT con claims personalizados, fecha de emisión y expiración.
     * @param extraClaims Mapa con información adicional para el payload.
     * @param userDetails Usuario al que se le asigna el token.
     * @return Token JWT compacto y firmado.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Valida si el token pertenece al usuario y si no ha expirado.
     * @param token Token JWT a validar.
     * @param userDetails Usuario contra el que se valida el token.
     * @return true si el token es válido, false en caso contrario.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}