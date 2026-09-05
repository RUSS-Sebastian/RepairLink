package com.repairlink.backend.part.dto;

import java.util.List;

public record PartPageResponse(
        List<PartResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        PartSummary summary
) {
    public record PartSummary(
            long total,
            long active,
            long lowStock,
            long outOfStock
    ) {
    }
}