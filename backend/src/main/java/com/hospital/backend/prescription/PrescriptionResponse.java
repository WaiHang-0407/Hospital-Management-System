package com.hospital.backend.prescription;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PrescriptionResponse(
        UUID id,
        UUID appointmentId,
        String patientName,
        String doctorName,
        String department,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        String diagnosis,
        String notes,
        OffsetDateTime createdAt,
        List<PrescriptionItemResponse> items
) {
}
