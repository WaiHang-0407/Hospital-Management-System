package com.hospital.backend.doctor;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record DoctorUnavailabilityRequest(
        @NotNull @FutureOrPresent LocalDate unavailableDate,
        @NotNull LocalTime startTime,
        String reason
) {
}
