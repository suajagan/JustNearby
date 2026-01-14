package org.example.backend.repository;

import org.example.backend.model.FriendRequest;
import org.example.backend.model.FriendRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {

    List<FriendRequest> findAllByToUserIdAndStatusOrderByCreatedAtDesc(String toUserId, FriendRequestStatus status);

    List<FriendRequest> findAllByFromUserIdAndStatusOrderByCreatedAtDesc(String fromUserId, FriendRequestStatus status);

    Optional<FriendRequest> findByFromUserIdAndToUserIdAndStatus(String fromUserId, String toUserId, FriendRequestStatus status);

    Optional<FriendRequest> findByFromUserIdAndToUserIdAndStatusOrFromUserIdAndToUserIdAndStatus(
            String from1, String to1, FriendRequestStatus status1,
            String from2, String to2, FriendRequestStatus status2
    );
}
