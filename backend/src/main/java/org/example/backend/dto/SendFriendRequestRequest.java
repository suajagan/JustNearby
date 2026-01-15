package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record SendFriendRequestRequest(@NotBlank String toUserId) {}
