package org.example.backend.repository;

import org.example.backend.model.chat.Conversation;
import org.example.backend.model.chat.ConversationType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findAllByParticipantIdsContainingOrderByLastMessageAtDesc(String userId);

    Optional<Conversation> findByTypeAndPostIdAndParticipantIds(
            ConversationType type,
            String postId,
            Set<String> participantIds
    );

    Optional<Conversation> findByTypeAndPostIdIsNullAndParticipantIds(
            ConversationType type,
            Set<String> participantIds
    );
}
