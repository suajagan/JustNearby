package org.example.backend.dto;

import org.example.backend.model.Address;

import java.util.Set;

public record ProfileResponse(
        String name,
        String email,
        String phoneNumber,
        Address address,
        String bio,
        Set<String> roles,
        String profileImageUrl,
        boolean profileComplete
) {
}
