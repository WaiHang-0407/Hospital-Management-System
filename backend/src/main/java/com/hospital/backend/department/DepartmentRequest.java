package com.hospital.backend.department;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(
        @NotBlank String name,
        String description
) {
}
