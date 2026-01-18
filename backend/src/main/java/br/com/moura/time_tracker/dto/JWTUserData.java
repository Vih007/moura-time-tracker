package br.com.moura.time_tracker.dto;

import java.util.UUID;

public record JWTUserData(
        UUID id,
        String email,
        String role
) {
}
