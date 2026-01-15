package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.FriendRequestResponse;
import org.example.backend.dto.SendFriendRequestRequest;
import org.example.backend.service.FriendRequestService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends/requests")
public class FriendRequestController {

    private final FriendRequestService service;

    public FriendRequestController(FriendRequestService service) {
        this.service = service;
    }

    @PostMapping
    public FriendRequestResponse send(@Valid @RequestBody SendFriendRequestRequest req, Authentication auth) {
        return FriendRequestResponse.from(service.send(auth, req.toUserId()));
    }

    @GetMapping("/incoming")
    public List<FriendRequestResponse> incoming(Authentication auth) {
        return service.incoming(auth).stream().map(FriendRequestResponse::from).toList();
    }

    @GetMapping("/outgoing")
    public List<FriendRequestResponse> outgoing(Authentication auth) {
        return service.outgoing(auth).stream().map(FriendRequestResponse::from).toList();
    }

    @PostMapping("/{id}/accept")
    public FriendRequestResponse accept(@PathVariable String id, Authentication auth) {
        return FriendRequestResponse.from(service.accept(auth, id));
    }

    @PostMapping("/{id}/reject")
    public FriendRequestResponse reject(@PathVariable String id, Authentication auth) {
        return FriendRequestResponse.from(service.reject(auth, id));
    }
}
