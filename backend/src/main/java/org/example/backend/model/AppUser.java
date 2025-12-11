package org.example.backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
public record AppUser(
        @Id String id,
        String name,
        String email
) {
}
