package com.repairlink.backend.additionalWork.dto;

import java.util.List;

public record AdditionalServicePageResponse(
        List<AdditionalServiceResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        Summary summary
) {
    public record Summary(
            long total,
            long active,
            long inactive,
            long archived
    ) {
    }
}
