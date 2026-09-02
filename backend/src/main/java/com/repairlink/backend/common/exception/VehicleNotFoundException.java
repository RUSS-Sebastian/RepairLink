package com.repairlink.backend.common.exception;

public class VehicleNotFoundException extends RuntimeException {

    public VehicleNotFoundException() {
        super("Vehicle was not found.");
    }
}
