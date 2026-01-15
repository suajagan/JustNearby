package org.example.backend.controller;

import org.example.backend.dto.ConversationResponse;
import org.example.backend.dto.CreateMarketplaceConversationRequest;
import org.example.backend.dto.CreateMessageRequest;
import org.example.backend.dto.MessageResponse;
import org.example.backend.service.ChatService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/marketplace")
    public ConversationResponse createMarketplaceConversation(
            Authentication auth,
            @RequestBody CreateMarketplaceConversationRequest request
    ) {
        return chatService.createMarketplaceConversation(auth, request);
    }

    @GetMapping
    public List<ConversationResponse> listMyConversations(Authentication auth) {
        return chatService.listMyConversations(auth);
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> listMessages(
            Authentication auth,
            @PathVariable("id") String conversationId
    ) {
        return chatService.listMessages(auth, conversationId);
    }
    @PostMapping("/friend/{userId}")
    public ConversationResponse createFriendConversation(
            Authentication auth,
            @PathVariable("userId") String otherUserId
    ) {
        return chatService.createFriendConversation(auth, otherUserId);
    }


    @PostMapping("/{id}/messages")
    public MessageResponse sendMessage(
            Authentication auth,
            @PathVariable("id") String conversationId,
            @RequestBody CreateMessageRequest request
    ) {
        return chatService.sendMessage(auth, conversationId, request);
    }
}
