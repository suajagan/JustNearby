package org.example.backend.model.chat;

import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.Set;

public record Conversation(
        @Id String id,
        Set<String> participantIds,
        ConversationType type,
        String postId,
        Instant createdAt,
        Instant lastMessageAt
) {
}
