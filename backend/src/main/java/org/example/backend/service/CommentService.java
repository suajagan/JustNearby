package org.example.backend.service;

import org.example.backend.dto.Comment;
import org.example.backend.dto.CommentResponse;
import org.example.backend.dto.CreateCommentRequest;
import org.example.backend.model.AppUser;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final AppUserRepository appUserRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          AppUserRepository appUserRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.appUserRepository = appUserRepository;
    }

    public CommentResponse create(String postId, CreateCommentRequest request, Authentication auth) {

        postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (request == null || request.text() == null || request.text().isBlank()) {
            throw new IllegalArgumentException("text is required");
        }

        String text = request.text().trim();
        if (text.length() > 1000) {
            throw new IllegalArgumentException("comment is too long (max 1000 chars)");
        }

        Instant now = Instant.now();
        String principal = (auth != null) ? auth.getName() : null;

        String authorName = (principal != null) ? principal : "User";
        String authorRole = null;
        String authorProfileImageUrl = null;

        if (principal != null) {
            Optional<AppUser> opt = appUserRepository.findByEmail(principal);
            if (opt.isPresent()) {
                AppUser user = opt.get();
                if (user.name() != null && !user.name().isBlank()) authorName = user.name().trim();
                else if (user.email() != null && !user.email().isBlank()) authorName = user.email().trim();
                var roles = user.roles();
                if (roles != null && !roles.isEmpty()) {
                    authorRole = roles.iterator().next().toString();
                }
                authorProfileImageUrl = user.profileImageUrl();
            }
        }

        Comment toSave = new Comment(
                null,
                postId,
                text,
                authorName,
                authorRole,
                authorProfileImageUrl,
                now
        );

        Comment saved = commentRepository.save(toSave);
        return toResponse(saved);
    }

    public List<CommentResponse> list(String postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CommentResponse toResponse(Comment c) {
        return new CommentResponse(
                c.id(),
                c.postId(),
                c.text(),
                c.authorName(),
                c.authorRole(),
                c.authorProfileImageUrl(),
                c.createdAt()
        );
    }
}
