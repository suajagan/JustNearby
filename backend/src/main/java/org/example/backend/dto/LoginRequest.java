package org.example.backend.dto;

public record LoginRequest(
        String email,
        String password
) {
}
