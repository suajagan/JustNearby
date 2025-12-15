package org.example.backend.dto;

public record SignUpRequest(
        String name,
        String email,
        String password
) {
}
