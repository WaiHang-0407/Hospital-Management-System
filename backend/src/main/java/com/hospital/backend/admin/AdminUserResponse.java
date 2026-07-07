package com.hospital.backend.admin;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        boolean enabled,
        OffsetDateTime createdAt,
        List<String> roles,
        String doctorSpecialization
) {
}
