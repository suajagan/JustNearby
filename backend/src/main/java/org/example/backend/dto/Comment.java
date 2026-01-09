package org.example.backend.dto;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
@Document("comments")
public record Comment(
        @Id
        String id,
        String postId,
        String text,
        String authorName,
        String authorRole,
        String authorProfileImageUrl,
        Instant createdAt
) {
}
