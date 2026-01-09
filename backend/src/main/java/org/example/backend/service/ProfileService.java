package org.example.backend.service;

import org.example.backend.dto.ProfileResponse;
import org.example.backend.dto.ProfileUpdateRequest;
import org.example.backend.model.Address;
import org.example.backend.model.AppUser;
import org.example.backend.repository.AppUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final AppUserRepository repository;

    public ProfileService(AppUserRepository repository) {
        this.repository = repository;
    }

    public ProfileResponse updateMyProfile(
            Authentication authentication,
            ProfileUpdateRequest request
    ) {
        if (authentication == null) {
            throw new RuntimeException("Not authenticated");
        }

        String email = extractEmail(authentication);

        AppUser user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String phoneNumber =
                request.phoneNumber() != null ? request.phoneNumber() : user.phoneNumber();

        Address address =
                request.address() != null ? request.address() : user.address();

        boolean profileComplete = isProfileComplete(phoneNumber, address);

        AppUser updatedUser = new AppUser(
                user.id(),
                user.name(),
                user.email(),
                user.passwordHash(),
                user.authProvider(),
                user.githubLogin(),
                phoneNumber,
                address,
                request.bio() != null ? request.bio() : user.bio(),
                request.roles() != null ? request.roles() : user.roles(),
                request.profileImageUrl() != null ? request.profileImageUrl() : user.profileImageUrl(),
                profileComplete
        );

        repository.save(updatedUser);

        return toProfileResponse(updatedUser);
    }

    public ProfileResponse getMyProfile(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("Not authenticated");
        }

        String email = extractEmail(authentication);

        AppUser user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toProfileResponse(user);
    }

    private boolean isProfileComplete(String phoneNumber, Address address) {

        if (phoneNumber == null || phoneNumber.isBlank()) {
            return false;
        }

        if (address == null) {
            return false;
        }

        if (address.street() == null || address.street().isBlank()) {
            return false;
        }

        if (address.city() == null || address.city().isBlank()) {
            return false;
        }

        if (address.pincode() == null || address.pincode().isBlank()) {
            return false;
        }

        return true;
    }

    private ProfileResponse toProfileResponse(AppUser user) {
        return new ProfileResponse(
                user.name(),
                user.email(),
                user.phoneNumber(),
                user.address(),
                user.bio(),
                user.roles(),
                user.profileImageUrl(),
                user.profileComplete()
        );
    }

    private String extractEmail(Authentication authentication) {

        Object principal = authentication.getPrincipal();

        if (principal instanceof User springUser) {
            return springUser.getUsername();
        }

        if (principal instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            String login = oAuth2User.getAttribute("login");

            if (email == null && login != null) {
                return login + "@github.local";
            }
            return email;
        }

        throw new RuntimeException("Unsupported authentication type");
    }
}
