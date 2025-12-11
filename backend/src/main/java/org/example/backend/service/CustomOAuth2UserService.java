package org.example.backend.service;

import org.example.backend.model.AppUser;
import org.example.backend.repository.AppUserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final AppUserRepository repository;

    public CustomOAuth2UserService(AppUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User user = super.loadUser(request);

        String email = user.getAttribute("email");
        String name = user.getAttribute("name");
        String login = user.getAttribute("login");
        if (email == null) {
            email = login + "@github-user";
        }

        // check if user already exists
        Optional<AppUser> existing = repository.findByEmail(email);

        if (existing.isEmpty()) {
            // FIRST TIME → SIGN UP
            AppUser newUser = new AppUser(
                    null,
                    email,
                    name != null ? name : login
            );

            repository.save(newUser);
        }

        return user;
    }
}
