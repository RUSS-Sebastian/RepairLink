package com.repairlink.backend.common.exception;

public class AdditionalServiceNameAlreadyExistsException extends RuntimeException {
    public AdditionalServiceNameAlreadyExistsException() {
        super("An additional service with this name already exists.");
    }
}
