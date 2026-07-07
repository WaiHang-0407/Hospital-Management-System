package com.hospital.backend.patient;

import java.util.UUID;

public record PatientSummaryResponse(
        UUID patientId,
        String fullName,
        String email,
        String phone
) {
}
