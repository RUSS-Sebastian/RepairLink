package com.repairlink.backend.common.exception;

public class PartNumberAlreadyExistsException extends RuntimeException {
    public PartNumberAlreadyExistsException() {
        super("This part number is already in use.");
    }
}