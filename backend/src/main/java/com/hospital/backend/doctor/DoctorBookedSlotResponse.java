package com.hospital.backend.doctor;

import java.time.LocalTime;

public record DoctorBookedSlotResponse(
        LocalTime startTime
) {
}
