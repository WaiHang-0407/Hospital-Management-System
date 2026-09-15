package com.hospital.backend.medicine;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MedicineRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 100) String category,
        @Size(max = 100) String strength,
        @Size(max = 50) String unit,
        @Min(0) int stockQuantity,
        @DecimalMin("0.00") BigDecimal price
) {
}
