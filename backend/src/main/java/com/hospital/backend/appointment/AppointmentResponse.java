package com.hospital.backend.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        String department,
        String preferredDoctor,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        String reason,
        String notes,
        String contactNumber,
        String status
) {
}
