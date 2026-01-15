package org.example.backend.model;

import org.springframework.data.annotation.Id;

import java.time.Instant;

public record FriendRequest(
        @Id String id,
        String fromUserId,
        String toUserId,
        FriendRequestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
