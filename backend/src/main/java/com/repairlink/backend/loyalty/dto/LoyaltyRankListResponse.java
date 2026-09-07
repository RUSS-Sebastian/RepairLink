package com.repairlink.backend.loyalty.dto;

import java.util.List;

public record LoyaltyRankListResponse(
        List<LoyaltyRankResponse> items,
        long total,
        long active,
        long inactive
) {
}
