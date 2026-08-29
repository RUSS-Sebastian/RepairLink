package com.repairlink.backend.common.exception;

public class PhoneAlreadyExistsException extends RuntimeException {

    public PhoneAlreadyExistsException() {
        super("An account with this phone number already exists.");
    }
}
