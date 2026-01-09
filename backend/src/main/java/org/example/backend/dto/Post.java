package org.example.backend.dto;

import org.example.backend.model.post.ItemCondition;
import org.example.backend.model.post.OfferType;
import org.example.backend.model.post.PostCategory;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record Post(
        @Id String id,
        PostCategory category,
        String title,
        String description,
        String locationText,
        String authorName,
        String authorRole,
        String authorProfileImageUrl,
        Instant createdAt,
        Instant updatedAt,
        OfferType offerType,
        BigDecimal price,
        String currency,
        ItemCondition condition,
        String itemCategory,
        Instant eventStart,
        Instant eventEnd,
        String eventLocation,
        Boolean isPublic,
        List<String> imageUrls

) {
}
