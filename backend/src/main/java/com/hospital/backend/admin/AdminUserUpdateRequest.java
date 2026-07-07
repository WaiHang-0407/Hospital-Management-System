package com.hospital.backend.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminUserUpdateRequest(
        @NotBlank String role,
        String doctorSpecialization
) {
}
