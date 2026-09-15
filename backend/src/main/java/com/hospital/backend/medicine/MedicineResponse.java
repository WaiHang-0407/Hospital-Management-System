package com.hospital.backend.medicine;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicineResponse(
        UUID id,
        String name,
        String category,
        String strength,
        String unit,
        int stockQuantity,
        BigDecimal price,
        boolean active,
        OffsetDateTime createdAt
) {
}
