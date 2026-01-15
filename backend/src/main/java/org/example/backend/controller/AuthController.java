package org.example.backend.controller;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.SignUpRequest;
import org.example.backend.model.AppUser;
import org.example.backend.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository repository;
    private final BCryptPasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(AppUserRepository repository, BCryptPasswordEncoder encoder, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignUpRequest signUpRequest) {
        Optional<AppUser> exists = repository.findByEmail(signUpRequest.email());
        if (exists.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        AppUser newUser = new AppUser(
                null,
                signUpRequest.name(),
                signUpRequest.email(),
                encoder.encode(signUpRequest.password()),
                "LOCAL",
                null,
                null,
                null,
                null,
                Set.of(),
                null,
                false,
                Set.of()
        );

        repository.save(newUser);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {

        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(),
                        loginRequest.password()
                )
        );


        SecurityContextHolder.getContext().setAuthentication(authentication);

        AppUser appUser = repository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email not found"));

        return new AuthResponse(
                appUser.name(),   // ← Abhi
                appUser.email(),
                false
        );
    }

    @GetMapping("/me")
    public Object getMe(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (authentication.getPrincipal() instanceof User user) {
            String email = user.getUsername();

            AppUser appUser = repository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return new AuthResponse(
                    appUser.name(),   // ← Abhi
                    appUser.email(),
                    false
            );
        }

        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            String login = oAuth2User.getAttribute("login");
            String name = oAuth2User.getAttribute("name");

            if (email == null && login != null) {
                email = login + "@github.local";
            }

            return new AuthResponse(
                    name != null ? name : login,
                    email,
                    false
            );
        }

        return null;
    }


    @GetMapping("/exists")
    public boolean checkUserExists(@RequestParam String email) {
        return repository.findByEmail(email).isPresent();
    }

}
