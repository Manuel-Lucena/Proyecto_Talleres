package com.mlg.taller.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private T data;
    private String message;
    private int status;
    private boolean success;

    // Método para respuestas exitosas (ya lo tendrás parecido)
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message, 200, true);
    }

    // EL QUE TE FALTA: Método para respuestas de error
    public static <T> ApiResponse<T> error(String message, int status) {
        return new ApiResponse<>(null, message, status, false);
    }
}