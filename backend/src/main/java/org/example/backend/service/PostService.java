package org.example.backend.service;

import org.example.backend.dto.CreatePostRequest;
import org.example.backend.dto.Post;
import org.example.backend.dto.PostResponse;
import org.example.backend.model.AppUser;
import org.example.backend.model.post.PostCategory;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;

    public PostService(PostRepository postRepository, AppUserRepository appUserRepository) {
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
    }

    private String resolveEmail(Authentication auth) {
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails ud) {
            return ud.getUsername(); // email in your app
        }
        if (principal instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            String login = oAuth2User.getAttribute("login");

            if ((email == null || email.isBlank()) && login != null && !login.isBlank()) {
                email = login + "@github.local";
            }
            return email;
        }

        return auth.getName();
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

        String currency = (request.currency() == null || request.currency().isBlank())
                ? "EUR"
                : request.currency().trim();

        var eventStart = request.category() == PostCategory.EVENT ? request.eventStart() : null;
        var eventEnd = request.category() == PostCategory.EVENT ? request.eventEnd() : null;
        var eventLocation = request.category() == PostCategory.EVENT ? request.eventLocation() : null;
        var isPublic = request.category() == PostCategory.EVENT ? request.isPublic() : null;

        Instant now = Instant.now();

        String principal = resolveEmail(auth);
        if (principal == null || principal.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        String authorName = principal;
        String authorRole = null;
        String authorProfileImageUrl = null;

        String city;

        Optional<AppUser> opt = appUserRepository.findByEmail(principal);
        if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }

        AppUser user = opt.get();
        String authorId = user.id();

        if (!user.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "PROFILE_NOT_COMPLETE");
        }

        if (user.name() != null && !user.name().isBlank()) {
            authorName = user.name().trim();
        } else if (user.email() != null && !user.email().isBlank()) {
            authorName = user.email().trim();
        }

        if (user.roles() != null && !user.roles().isEmpty()) {
            authorRole = user.roles().iterator().next();
        }

        authorProfileImageUrl = user.profileImageUrl();

        city = (user.address() != null) ? user.address().city() : null;
        if (city == null || city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CITY_NOT_SET");
        }
        city = city.trim();

        Post postToSave = new Post(
                null,
                request.category(),
                request.title().trim(),
                request.description().trim(),
                request.locationText(),
                city,
                authorId,
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

    public List<PostResponse> list(PostCategory category, Authentication auth) {

        String principal = resolveEmail(auth);
        if (principal == null || principal.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        AppUser user = appUserRepository.findByEmail(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!user.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "PROFILE_NOT_COMPLETE");
        }

        String city = (user.address() != null) ? user.address().city() : null;
        if (city == null || city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CITY_NOT_SET");
        }
        city = city.trim();

        List<Post> posts = (category == null)
                ? postRepository.findAllByCityOrderByCreatedAtDesc(city)
                : postRepository.findAllByCityAndCategoryOrderByCreatedAtDesc(city, category);

        return posts.stream()
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
                p.authorId(),
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
