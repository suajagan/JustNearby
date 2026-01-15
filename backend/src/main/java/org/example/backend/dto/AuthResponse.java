package org.example.backend.dto;

public record AuthResponse(
        String name,
        String email,
        boolean isNew
) {
}
