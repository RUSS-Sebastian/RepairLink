package com.repairlink.backend.common.exception;

public class LoyaltyRankNotFoundException extends RuntimeException {
    public LoyaltyRankNotFoundException() {
        super("Loyalty rank was not found.");
    }
}
