package org.example.backend.repository;

import org.example.backend.model.chat.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findAllByConversationIdOrderByCreatedAtAsc(String conversationId);
}
