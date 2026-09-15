package com.hospital.backend.prescription;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record PrescriptionRequest(
        @NotNull UUID appointmentId,
        @NotBlank @Size(max = 255) String diagnosis,
        String notes,
        @NotEmpty List<@Valid PrescriptionItemRequest> items
) {
}
