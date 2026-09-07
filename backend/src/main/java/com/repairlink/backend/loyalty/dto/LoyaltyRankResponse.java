package com.repairlink.backend.loyalty.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LoyaltyRankResponse(
        UUID id,
        String rankName,
        long minimumPoints,
        long maximumPoints,
        long configuredMinimumPoints,
        long configuredMaximumPoints,
        BigDecimal discountPercentage,
        Integer rankOrder,
        boolean active,
        boolean protectedRank,
        Instant createdAt,
        Instant updatedAt
) {
}
