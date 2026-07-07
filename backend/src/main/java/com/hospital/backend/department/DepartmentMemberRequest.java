package com.hospital.backend.department;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DepartmentMemberRequest(@NotNull UUID userId) {
}
