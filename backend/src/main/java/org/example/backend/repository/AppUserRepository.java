package org.example.backend.repository;

import org.example.backend.model.AppUser;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;
public interface AppUserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findAllByAddress_City(String city);
}
