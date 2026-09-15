package com.hospital.backend.billing;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record BillResponse(
        UUID id,
        UUID appointmentId,
        String patientName,
        String doctorName,
        String department,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        String description,
        BigDecimal amount,
        String status,
        OffsetDateTime paidAt,
        OffsetDateTime createdAt,
        List<BillItemResponse> items
) {
}
