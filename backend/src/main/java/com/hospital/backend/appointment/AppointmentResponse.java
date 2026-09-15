package com.hospital.backend.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        String patientName,
        String patientPhone,
        UUID doctorId,
        String department,
        String preferredDoctor,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        String reason,
        String notes,
        String status
) {
}
