package org.example.backend.controller;

import org.example.backend.dto.UserCardResponse;
import org.example.backend.model.AppUser;
import org.example.backend.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository appUserRepository;

    public UserController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
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

    @GetMapping("/nearby")
    public List<UserCardResponse> nearby(Authentication auth) {
        String email = resolveEmail(auth);
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        AppUser me = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!me.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "PROFILE_NOT_COMPLETE");
        }

        String myCity = me.address() != null ? me.address().city() : null;
        if (myCity == null || myCity.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CITY_NOT_SET");
        }
        myCity = myCity.trim();

        return appUserRepository.findAllByAddress_City(myCity).stream()
                .filter(u -> u.id() != null && !u.id().equals(me.id())) // exclude me
                .map(u -> new UserCardResponse(
                        u.id(),
                        (u.name() != null && !u.name().isBlank()) ? u.name() : u.email(),
                        u.email(),
                        (u.address() != null ? u.address().city() : null),
                        u.profileImageUrl()
                ))
                .toList();
    }
}
