package com.hospital.backend.appointment;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleAppointmentRequest(
        @NotNull @FutureOrPresent LocalDate appointmentDate,
        @NotNull LocalTime appointmentTime
) {
    AppointmentRequest toAppointmentRequest(Appointment appointment) {
        return new AppointmentRequest(
                appointment.getDepartment(),
                appointment.getDoctor() == null ? null : appointment.getDoctor().getId(),
                appointment.getPreferredDoctor(),
                appointmentDate,
                appointmentTime,
                appointment.getReason(),
                appointment.getNotes()
        );
    }
}
