package org.example.backend.service;

import org.example.backend.dto.ConversationResponse;
import org.example.backend.dto.CreateMarketplaceConversationRequest;
import org.example.backend.dto.CreateMessageRequest;
import org.example.backend.dto.MessageResponse;
import org.example.backend.model.AppUser;
import org.example.backend.model.chat.Conversation;
import org.example.backend.model.chat.ConversationType;
import org.example.backend.model.chat.Message;
import org.example.backend.model.post.PostCategory;
import org.example.backend.dto.Post;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.repository.ConversationRepository;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final AppUserRepository appUserRepository;
    private final PostRepository postRepository;

    public ChatService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            AppUserRepository appUserRepository,
            PostRepository postRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.appUserRepository = appUserRepository;
        this.postRepository = postRepository;
    }

    private AppUser requireMe(Authentication auth) {
        String email = resolveEmail(auth);
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        AppUser me = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!me.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "PROFILE_NOT_COMPLETE");
        }

        if (me.id() == null || me.id().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id missing");
        }
        return me;
    }

    private String requireCity(AppUser u) {
        String city = (u.address() != null) ? u.address().city() : null;
        if (city == null || city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CITY_NOT_SET");
        }
        return city.trim();
    }

    private String resolveEmail(Authentication auth) {
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        if (principal instanceof UserDetails ud) {
            return ud.getUsername();
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

    public List<ConversationResponse> listMyConversations(Authentication auth) {
        AppUser me = requireMe(auth);
        return conversationRepository
                .findAllByParticipantIdsContainingOrderByLastMessageAtDesc(me.id())
                .stream()
                .map(c -> toResponse(c, me))
                .toList();
    }

    public ConversationResponse createMarketplaceConversation(Authentication auth, CreateMarketplaceConversationRequest req) {
        AppUser me = requireMe(auth);

        if (req == null || req.postId() == null || req.postId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "postId required");
        }

        Post post = postRepository.findById(req.postId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.category() != PostCategory.OFFER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NOT_MARKETPLACE_POST");
        }

        if (post.authorId() == null || post.authorId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "POST_AUTHOR_ID_MISSING");
        }

        String sellerId = post.authorId().trim();

        if (me.id().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANNOT_MESSAGE_SELF");
        }

        AppUser seller = appUserRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!seller.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TARGET_PROFILE_NOT_COMPLETE");
        }
        String myCity = requireCity(me);
        String sellerCity = requireCity(seller);
        if (!myCity.equalsIgnoreCase(sellerCity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DIFFERENT_CITY");
        }

        Set<String> participants = Set.of(me.id(), sellerId);

        Optional<Conversation> existing = conversationRepository.findByTypeAndPostIdAndParticipantIds(
                ConversationType.MARKETPLACE,
                post.id(),
                participants
        );

        if (existing.isPresent()) {
            return toResponse(existing.get(), me);
        }

        Instant now = Instant.now();

        Conversation conv = new Conversation(
                null,
                participants,
                ConversationType.MARKETPLACE,
                post.id(),
                now,
                now
        );

        Conversation savedConv = conversationRepository.save(conv);

        String firstText = "Hi, I'm interested in your post: " + post.title();

        Message firstMsg = new Message(
                null,
                savedConv.id(),
                me.id(),
                firstText,
                now
        );
        messageRepository.save(firstMsg);

        return toResponse(savedConv, me);
    }

    public ConversationResponse createFriendConversation(Authentication auth, String otherUserId) {
        AppUser me = requireMe(auth);

        if (otherUserId == null || otherUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId required");
        }
        if (me.id().equals(otherUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANNOT_MESSAGE_SELF");
        }

        AppUser other = appUserRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!other.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TARGET_PROFILE_NOT_COMPLETE");
        }
        ensureFriends(me, otherUserId);

        Set<String> participants = Set.of(me.id(), otherUserId);

        Optional<Conversation> existing = conversationRepository.findByTypeAndPostIdIsNullAndParticipantIds(
                ConversationType.FRIEND,
                participants
        );

        if (existing.isPresent()) {
            return toResponse(existing.get(), me);
        }

        Instant now = Instant.now();

        Conversation conv = new Conversation(
                null,
                participants,
                ConversationType.FRIEND,
                null,
                now,
                now
        );

        Conversation saved = conversationRepository.save(conv);
        return toResponse(saved, me);
    }

    public MessageResponse sendMessage(Authentication auth, String conversationId, CreateMessageRequest req) {
        AppUser me = requireMe(auth);

        if (conversationId == null || conversationId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "conversationId required");
        }
        if (req == null || req.text() == null || req.text().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text required");
        }
        String text = req.text().trim();
        if (text.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TEXT_TOO_LONG");
        }

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conv.participantIds().contains(me.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_A_PARTICIPANT");
        }

        if (conv.type() == ConversationType.FRIEND) {
            ensureFriends(me, otherParticipant(conv, me.id()));
        }

        Instant now = Instant.now();
        Message msg = new Message(
                null,
                conv.id(),
                me.id(),
                text,
                now
        );
        Message saved = messageRepository.save(msg);

        Conversation updatedConv = new Conversation(
                conv.id(),
                conv.participantIds(),
                conv.type(),
                conv.postId(),
                conv.createdAt(),
                now
        );
        conversationRepository.save(updatedConv);

        return toResponse(saved);
    }

    public List<MessageResponse> listMessages(Authentication auth, String conversationId) {
        AppUser me = requireMe(auth);

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conv.participantIds().contains(me.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_A_PARTICIPANT");
        }

        return messageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void ensureFriends(AppUser me, String otherUserId) {
        AppUser other = appUserRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String myCity = requireCity(me);
        String otherCity = requireCity(other);
        if (!myCity.equalsIgnoreCase(otherCity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DIFFERENT_CITY");
        }

        Set<String> myFriends = me.friendIds() != null ? me.friendIds() : Set.of();
        if (!myFriends.contains(otherUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_FRIENDS");
        }
    }

    private String otherParticipant(Conversation conv, String myId) {
        return conv.participantIds().stream()
                .filter(id -> !id.equals(myId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid conversation"));
    }

    private ConversationResponse toResponse(Conversation c, AppUser me) {
        String otherUserId = null;
        String otherUserName = null;
        String otherUserProfileImageUrl = null;

        if (me != null && c.participantIds() != null) {
            otherUserId = c.participantIds().stream()
                    .filter(id -> me.id() == null || !id.equals(me.id()))
                    .findFirst()
                    .orElse(null);

            if (otherUserId != null) {
                AppUser other = appUserRepository.findById(otherUserId).orElse(null);
                if (other != null) {
                    otherUserName = other.name();
                    otherUserProfileImageUrl = other.profileImageUrl();
                }
            }
        }

        return new ConversationResponse(
                c.id(),
                c.participantIds(),
                c.type(),
                c.postId(),
                c.createdAt(),
                c.lastMessageAt(),
                otherUserId,
                otherUserName,
                otherUserProfileImageUrl
        );
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.id(),
                m.conversationId(),
                m.senderId(),
                m.text(),
                m.createdAt()
        );
    }
}
