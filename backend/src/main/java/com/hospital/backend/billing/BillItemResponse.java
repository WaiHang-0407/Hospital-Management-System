package com.hospital.backend.billing;

import java.math.BigDecimal;
import java.util.UUID;

public record BillItemResponse(
        UUID id,
        String itemName,
        String itemType,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
) {
}
