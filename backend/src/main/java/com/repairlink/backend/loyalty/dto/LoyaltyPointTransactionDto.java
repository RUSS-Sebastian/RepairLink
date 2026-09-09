package com.repairlink.backend.loyalty.dto;

import java.time.Instant;
import java.util.UUID;

public record LoyaltyPointTransactionDto(
        UUID transactionId,
        long pointsDelta,
        String transactionType,
        String description,
        UUID referenceId,
        Instant createdAt
) {
}
