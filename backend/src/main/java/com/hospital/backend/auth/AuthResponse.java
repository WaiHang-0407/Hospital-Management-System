package com.hospital.backend.auth;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String fullName,
        String email,
        List<String> roles
) {
}
