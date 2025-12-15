package org.example.backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Document("users")
public record AppUser(
        @Id String id,
        String name,
        String email,
        String passwordHash,
        String authProvider,
        String githubLogin,
        String phoneNumber,
        Address address,
        String bio,
        Set<String> roles,
        String profileImageUrl,
        boolean profileComplete
) { }
