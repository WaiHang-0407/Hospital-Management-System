package com.hospital.backend.department;

import java.util.List;
import java.util.UUID;

public record DepartmentMemberResponse(
        UUID userId,
        String fullName,
        String email,
        String phone,
        List<String> roles
) {
}
