package com.hospital.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PatientSignupRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8) String password,
        String phone,
        LocalDate dateOfBirth,
        String gender,
        String bloodType,
        String address,
        String emergencyContact
) {
}
