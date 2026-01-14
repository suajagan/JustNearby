package org.example.backend.controller;

import org.example.backend.dto.ProfileResponse;
import org.example.backend.model.Address;
import org.example.backend.repository.AppUserRepository;
import org.example.backend.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.Set;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileController.class)
@Import(ProfileService.class)
class ProfileControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    AppUserRepository repository;

    @Test
    @WithMockUser(username = "sushmita@mail.com")
    void shouldReturnMyProfile() throws Exception {

        when(repository.findByEmail("sushmita@mail.com"))
                .thenReturn(Optional.of(
                        new org.example.backend.model.AppUser(
                                "1",
                                "Sushmita",
                                "sushmita@mail.com",
                                null,
                                "LOCAL",
                                null,
                                "+491234567",
                                new Address("Street 1", "Aachen", "NRW", "52062"),
                                "Handyman nearby",
                                Set.of("HANDYMAN"),
                                null,
                                true,
                                Set.of()
                        )
                ));

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sushmita"))
                .andExpect(jsonPath("$.email").value("sushmita@mail.com"))
                .andExpect(jsonPath("$.profileComplete").value(true));
    }
}
