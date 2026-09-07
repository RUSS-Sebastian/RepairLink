package com.repairlink.backend.common.exception;

public class ScheduleNotFoundException extends RuntimeException {
    public ScheduleNotFoundException(String message) {
        super(message);
    }

    public ScheduleNotFoundException() {
        super("Schedule configuration not found.");
    }
}

