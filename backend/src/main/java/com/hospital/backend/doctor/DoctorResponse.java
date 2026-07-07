package com.hospital.backend.doctor;

import java.util.UUID;

public record DoctorResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        String specialization
) {
}
