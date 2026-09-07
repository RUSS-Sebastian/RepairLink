package com.repairlink.backend.common.exception;

public class AdditionalServiceNotFoundException extends RuntimeException {
    public AdditionalServiceNotFoundException() {
        super("Additional service was not found.");
    }
}
