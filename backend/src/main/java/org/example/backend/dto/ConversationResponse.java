package org.example.backend.dto;

import org.example.backend.model.chat.ConversationType;

import java.time.Instant;
import java.util.Set;

public record ConversationResponse(
        String id,
        Set<String> participantIds,
        ConversationType type,
        String postId,
        Instant createdAt,
        Instant lastMessageAt,
        String otherUserId,
        String otherUserName,
        String otherUserProfileImageUrl
) {
}
