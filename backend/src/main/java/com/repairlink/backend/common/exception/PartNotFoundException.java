package com.repairlink.backend.common.exception;

public class PartNotFoundException extends RuntimeException {
    public PartNotFoundException() {
        super("Part not found.");
    }
}