package com.repairlink.backend.common.exception;

public class LicensePlateAlreadyExistsException extends RuntimeException {

    public LicensePlateAlreadyExistsException() {
        super("License plate is already registered.");
    }
}
