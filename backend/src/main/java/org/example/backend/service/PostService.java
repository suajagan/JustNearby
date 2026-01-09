package org.example.backend.service;

import org.example.backend.dto.CreatePostRequest;
import org.example.backend.dto.Post;
import org.example.backend.dto.PostResponse;
import org.example.backend.model.AppUser;
import org.example.backend.model.post.PostCategory;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.repository.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;

    public PostService(PostRepository postRepository, AppUserRepository appUserRepository) {
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
    }

    public PostResponse create(CreatePostRequest request, Authentication auth) {


        if (request.category() == null) throw new IllegalArgumentException("category is required");
        if (request.title() == null || request.title().isBlank()) throw new IllegalArgumentException("title is required");
        if (request.description() == null || request.description().isBlank()) throw new IllegalArgumentException("description is required");


        if (request.category() == PostCategory.OFFER) {
            if (request.offerType() == null) {
                throw new IllegalArgumentException("offerType is required for category=OFFER");
            }

            if ("SELL".equals(String.valueOf(request.offerType())) && request.price() == null) {
                throw new IllegalArgumentException("price is required when offerType=SELL");
            }
        }

        if (request.category() == PostCategory.EVENT) {
            if (request.eventStart() == null) {
                throw new IllegalArgumentException("eventStart is required for category=EVENT");
            }
            if (request.eventLocation() == null || request.eventLocation().isBlank()) {
                throw new IllegalArgumentException("eventLocation is required for category=EVENT");
            }
        }


        List<String> imageUrls = request.imageUrls() == null ? List.of() : List.copyOf(request.imageUrls());
        if (imageUrls.size() > 5) throw new IllegalArgumentException("max 5 images allowed");

        // ---- currency ----
        String currency = (request.currency() == null || request.currency().isBlank())
                ? "EUR"
                : request.currency().trim();

        // ---- event fields only for EVENT ----
        var eventStart = request.category() == PostCategory.EVENT ? request.eventStart() : null;
        var eventEnd = request.category() == PostCategory.EVENT ? request.eventEnd() : null;
        var eventLocation = request.category() == PostCategory.EVENT ? request.eventLocation() : null;
        var isPublic = request.category() == PostCategory.EVENT ? request.isPublic() : null;

        Instant now = Instant.now();

        // ---- author from Authentication (not from request) ----
        String principal = (auth != null) ? auth.getName() : null;

        String authorName = (principal != null) ? principal : "User";
        String authorRole = null;
        String authorProfileImageUrl = null;

        if (principal != null) {
            Optional<AppUser> opt = appUserRepository.findByEmail(principal);
            if (opt.isPresent()) {
                AppUser user = opt.get();

                if (user.name() != null && !user.name().isBlank()) {
                    authorName = user.name().trim();
                } else if (user.email() != null && !user.email().isBlank()) {
                    authorName = user.email().trim();
                } else {
                    authorName = principal;
                }


                if (user.roles() != null && !user.roles().isEmpty()) {
                    var roles = user.roles();
                    if (roles != null && !roles.isEmpty()) {
                        authorRole = roles.iterator().next().toString();
                    }

                }

                authorProfileImageUrl = user.profileImageUrl(); // can be null
            }
        }

        Post postToSave = new Post(
                null,
                request.category(),
                request.title().trim(),
                request.description().trim(),
                request.locationText(),

                authorName,
                authorRole,
                authorProfileImageUrl,

                now,
                now,

                request.offerType(),
                request.price(),
                currency,
                request.condition(),
                request.itemCategory(),

                eventStart,
                eventEnd,
                eventLocation,
                isPublic,
                imageUrls
        );

        Post saved = postRepository.save(postToSave);
        return toResponse(saved);
    }
    public PostResponse getById(String id) {
        Post p = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return toResponse(p);
    }

    public List<PostResponse> list(PostCategory category) {
        List<Post> posts = (category == null)
                ? postRepository.findAll()
                : postRepository.findAllByCategory(category);

        return posts.stream()
                .sorted(Comparator.comparing(Post::createdAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    private PostResponse toResponse(Post p) {
        return new PostResponse(
                p.id(),
                p.category(),
                p.title(),
                p.description(),
                p.locationText(),

                p.authorName(),
                p.authorRole(),
                p.authorProfileImageUrl(),

                p.createdAt(),
                p.updatedAt(),

                p.offerType(),
                p.price(),
                p.currency(),
                p.condition(),
                p.itemCategory(),

                p.eventStart(),
                p.eventEnd(),
                p.eventLocation(),
                p.isPublic(),
                p.imageUrls()
        );
    }
}
