package com.repairlink.backend.common.exception;

public class LoyaltyRankNameAlreadyExistsException extends RuntimeException {
    public LoyaltyRankNameAlreadyExistsException() {
        super("A loyalty rank with this name already exists.");
    }
}
