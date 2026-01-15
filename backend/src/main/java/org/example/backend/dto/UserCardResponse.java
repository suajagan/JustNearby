package org.example.backend.dto;

public record UserCardResponse(
        String id,
        String name,
        String email,
        String city,
        String profileImageUrl
) {
}
