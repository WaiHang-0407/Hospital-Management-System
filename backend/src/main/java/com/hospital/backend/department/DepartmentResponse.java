package com.hospital.backend.department;

import java.util.List;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String description,
        boolean active,
        List<DepartmentMemberResponse> members
) {
}
