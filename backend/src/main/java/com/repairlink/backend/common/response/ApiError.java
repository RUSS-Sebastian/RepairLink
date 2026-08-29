package com.repairlink.backend.common.response;

public record ApiError(
        String code,
        String message
) {
}