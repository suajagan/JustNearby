package org.example.backend.controller;

import org.example.backend.dto.CommentResponse;
import org.example.backend.dto.CreateCommentRequest;
import org.example.backend.service.CommentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> list(@PathVariable String postId) {
        return commentService.list(postId);
    }

    @PostMapping
    public CommentResponse create(@PathVariable String postId,
                                  @RequestBody CreateCommentRequest request,
                                  Authentication auth) {
        return commentService.create(postId, request, auth);
    }
}
