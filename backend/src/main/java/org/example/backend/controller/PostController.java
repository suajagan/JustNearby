package org.example.backend.controller;

import org.example.backend.dto.CreatePostRequest;
import org.example.backend.dto.PostResponse;
import org.example.backend.model.post.PostCategory;
import org.example.backend.service.PostService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService){
        this.postService = postService;
    }

    @PostMapping
    public PostResponse create(@RequestBody CreatePostRequest request, Authentication auth) {
        return postService.create(request, auth);
    }

    @GetMapping
    public List<PostResponse> list(@RequestParam(required = false) PostCategory category,
                                   Authentication auth) {
        return postService.list(category, auth);
    }

    @GetMapping("/{id}")
    public PostResponse getById(@PathVariable String id) {
        return postService.getById(id);
    }

}
