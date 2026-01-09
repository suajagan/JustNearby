package org.example.backend.dto;

import java.time.Instant;

public record CommentResponse(
        String id,
        String postId,
        String text,
        String authorName,
        String authorRole,
        String authorProfileImageUrl,
        Instant createdAt
) {
}
