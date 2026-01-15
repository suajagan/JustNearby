package org.example.backend.model;

public record Address(
        String street,
        String city,
        String state,
        String pincode
) {
}
