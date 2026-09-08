package com.repairlink.backend.loyalty.dto;

import java.math.BigDecimal;

public record CustomerLoyaltyResponse(
        long totalPoints,
        long lifetimePoints,
        long servicesCompleted,
        String rankName,
        BigDecimal discountPercentage,
        long rankMinimumPoints,
        long rankMaximumPoints,
        String nextRankName,
        long pointsToNextRank
) {
}
