package org.example.backend.dto;

import org.example.backend.model.FriendRequest;
import org.example.backend.model.FriendRequestStatus;

import java.time.Instant;

public record FriendRequestResponse(
        String id,
        String fromUserId,
        String toUserId,
        FriendRequestStatus status,
        Instant createdAt
) {
    public static FriendRequestResponse from(FriendRequest fr) {
        return new FriendRequestResponse(fr.id(), fr.fromUserId(), fr.toUserId(), fr.status(), fr.createdAt());
    }
}
