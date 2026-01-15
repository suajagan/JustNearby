package org.example.backend.service;

import org.example.backend.model.AppUser;
import org.example.backend.model.FriendRequest;
import org.example.backend.model.FriendRequestStatus;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.repository.FriendRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;


import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final AppUserRepository appUserRepository;

    public FriendRequestService(FriendRequestRepository friendRequestRepository, AppUserRepository appUserRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.appUserRepository = appUserRepository;
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

        return me;
    }


    private String requireCity(AppUser u) {
        String city = (u.address() != null) ? u.address().city() : null;
        if (city == null || city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CITY_NOT_SET");
        }
        return city.trim();
    }

    public FriendRequest send(Authentication auth, String toUserId) {
        AppUser me = requireMe(auth);

        if (me.id() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id missing");
        if (toUserId == null || toUserId.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "toUserId required");
        if (me.id().equals(toUserId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANNOT_FRIEND_SELF");

        AppUser target = appUserRepository.findById(toUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!target.profileComplete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TARGET_PROFILE_NOT_COMPLETE");
        }

        String myCity = requireCity(me);
        String targetCity = requireCity(target);

        if (!myCity.equalsIgnoreCase(targetCity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DIFFERENT_CITY");
        }

        Set<String> myFriends = me.friendIds() != null ? me.friendIds() : Set.of();
        if (myFriends.contains(toUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ALREADY_FRIENDS");
        }

        boolean pendingExists = friendRequestRepository
                .findByFromUserIdAndToUserIdAndStatusOrFromUserIdAndToUserIdAndStatus(
                        me.id(), toUserId, FriendRequestStatus.PENDING,
                        toUserId, me.id(), FriendRequestStatus.PENDING
                )
                .isPresent();

        if (pendingExists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "REQUEST_ALREADY_EXISTS");
        }

        Instant now = Instant.now();
        FriendRequest fr = new FriendRequest(
                null,
                me.id(),
                toUserId,
                FriendRequestStatus.PENDING,
                now,
                now
        );

        return friendRequestRepository.save(fr);
    }

    public List<FriendRequest> incoming(Authentication auth) {
        AppUser me = requireMe(auth);
        return friendRequestRepository.findAllByToUserIdAndStatusOrderByCreatedAtDesc(me.id(), FriendRequestStatus.PENDING);
    }

    public List<FriendRequest> outgoing(Authentication auth) {
        AppUser me = requireMe(auth);
        return friendRequestRepository.findAllByFromUserIdAndStatusOrderByCreatedAtDesc(me.id(), FriendRequestStatus.PENDING);
    }

    public FriendRequest accept(Authentication auth, String requestId) {
        AppUser me = requireMe(auth);

        FriendRequest fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!fr.toUserId().equals(me.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_YOUR_REQUEST");
        }
        if (fr.status() != FriendRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "REQUEST_NOT_PENDING");
        }

        AppUser from = appUserRepository.findById(fr.fromUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        String myCity = requireCity(me);
        String fromCity = requireCity(from);
        if (!myCity.equalsIgnoreCase(fromCity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DIFFERENT_CITY");
        }

        FriendRequest accepted = new FriendRequest(
                fr.id(),
                fr.fromUserId(),
                fr.toUserId(),
                FriendRequestStatus.ACCEPTED,
                fr.createdAt(),
                Instant.now()
        );
        friendRequestRepository.save(accepted);

        appUserRepository.save(withAddedFriend(me, from.id()));
        appUserRepository.save(withAddedFriend(from, me.id()));

        return accepted;
    }

    public FriendRequest reject(Authentication auth, String requestId) {
        AppUser me = requireMe(auth);

        FriendRequest fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!fr.toUserId().equals(me.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_YOUR_REQUEST");
        }
        if (fr.status() != FriendRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "REQUEST_NOT_PENDING");
        }

        FriendRequest rejected = new FriendRequest(
                fr.id(),
                fr.fromUserId(),
                fr.toUserId(),
                FriendRequestStatus.REJECTED,
                fr.createdAt(),
                Instant.now()
        );
        return friendRequestRepository.save(rejected);
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

    public Set<String> friends(Authentication auth) {
        AppUser me = requireMe(auth);
        return me.friendIds() != null ? me.friendIds() : Set.of();
    }

    private AppUser withAddedFriend(AppUser user, String friendId) {
        Set<String> set = new HashSet<>();
        if (user.friendIds() != null) set.addAll(user.friendIds());
        set.add(friendId);

        return new AppUser(
                user.id(),
                user.name(),
                user.email(),
                user.passwordHash(),
                user.authProvider(),
                user.githubLogin(),
                user.phoneNumber(),
                user.address(),
                user.bio(),
                user.roles(),
                user.profileImageUrl(),
                user.profileComplete(),
                set
        );
    }
}
