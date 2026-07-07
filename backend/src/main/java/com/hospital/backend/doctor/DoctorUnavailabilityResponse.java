package com.hospital.backend.doctor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorUnavailabilityResponse(
        UUID id,
        UUID doctorId,
        LocalDate unavailableDate,
        LocalTime startTime,
        String reason
) {
}
