package org.example.backend.controller;

import org.example.backend.dto.ProfileResponse;
import org.example.backend.dto.ProfileUpdateRequest;
import org.example.backend.service.ProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse getMyProfile(Authentication authentication) {
        return profileService.getMyProfile(authentication);
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request
    ) {
        return profileService.updateMyProfile(authentication, request);
    }

}

