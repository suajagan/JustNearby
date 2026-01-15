package org.example.backend.controller;

import org.example.backend.service.FriendRequestService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/friends")
public class FriendsController {

    private final FriendRequestService service;

    public FriendsController(FriendRequestService service) {
        this.service = service;
    }

    @GetMapping
    public Set<String> friends(Authentication auth) {
        return service.friends(auth);
    }
}
