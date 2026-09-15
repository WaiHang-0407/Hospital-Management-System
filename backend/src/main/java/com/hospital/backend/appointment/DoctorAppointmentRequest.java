package com.hospital.backend.appointment;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorAppointmentRequest(
        @NotNull UUID patientId,
        @NotNull @FutureOrPresent LocalDate appointmentDate,
        @NotNull LocalTime appointmentTime,
        @NotBlank String reason,
        String notes
) {

    AppointmentRequest toAppointmentRequest() {
        return new AppointmentRequest(
                "Doctor Appointment",
                null,
                null,
                appointmentDate,
                appointmentTime,
                reason,
                notes
        );
    }
}
