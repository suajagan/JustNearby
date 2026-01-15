package org.example.backend.dto;

import org.example.backend.model.Address;

import java.util.Set;

public record ProfileUpdateRequest(
        String phoneNumber,
        Address address,
        String bio,
        String profileImageUrl,
        Set<String> roles
) {
}
