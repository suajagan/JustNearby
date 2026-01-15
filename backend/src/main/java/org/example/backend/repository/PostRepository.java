package org.example.backend.repository;

import org.example.backend.dto.Post;
import org.example.backend.model.post.PostCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findAllByCategory(PostCategory category);
    List<Post> findAllByCityOrderByCreatedAtDesc(String city);
    List<Post> findAllByCityAndCategoryOrderByCreatedAtDesc(String city, PostCategory category);

}
