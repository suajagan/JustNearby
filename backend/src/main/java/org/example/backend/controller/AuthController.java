package org.example.backend.controller;

import org.example.backend.repository.AppUserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository repository;

    public AuthController(AppUserRepository repository) {
        this.repository = repository;
    }
    @GetMapping("/me")
    public Object getMe(@AuthenticationPrincipal OAuth2User user) {
        return user == null ? null : user.getAttributes();
    }

    @GetMapping("/exists")
    public boolean checkUserExists(@RequestParam String email) {
        return repository.findByEmail(email).isPresent();
    }

}
