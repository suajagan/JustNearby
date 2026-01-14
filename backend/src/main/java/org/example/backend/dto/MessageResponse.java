package org.example.backend.dto;

import java.time.Instant;

public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        String text,
        Instant createdAt
) {
}
