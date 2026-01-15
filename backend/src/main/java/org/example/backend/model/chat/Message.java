package org.example.backend.model.chat;

import org.springframework.data.annotation.Id;

import java.time.Instant;

public record Message(
        @Id String id,
        String conversationId,
        String senderId,
        String text,
        Instant createdAt
) {
}
