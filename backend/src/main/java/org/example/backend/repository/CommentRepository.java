package org.example.backend.repository;

import jakarta.validation.constraints.Max;
import org.example.backend.dto.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(String postId);
}
