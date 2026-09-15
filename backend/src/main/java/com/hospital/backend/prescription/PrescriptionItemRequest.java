package com.hospital.backend.prescription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PrescriptionItemRequest(
        @NotBlank @Size(max = 150) String medicineName,
        @NotBlank @Size(max = 100) String dosage,
        @NotBlank @Size(max = 100) String frequency,
        @NotBlank @Size(max = 100) String duration,
        String instructions
) {
}
