package com.repairlink.backend.common.exception;

import com.repairlink.backend.common.response.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AdditionalServiceNotFoundException.class)
    public ResponseEntity<ApiError> handleAdditionalServiceNotFound(
            AdditionalServiceNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("ADDITIONAL_SERVICE_NOT_FOUND", exception.getMessage())
        );
    }

    @ExceptionHandler(AdditionalServiceNameAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleAdditionalServiceNameAlreadyExists(
            AdditionalServiceNameAlreadyExistsException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("ADDITIONAL_SERVICE_NAME_ALREADY_EXISTS", exception.getMessage())
        );
    }

    @ExceptionHandler(LoyaltyRankNotFoundException.class)
    public ResponseEntity<ApiError> handleLoyaltyRankNotFound(
            LoyaltyRankNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("LOYALTY_RANK_NOT_FOUND", exception.getMessage())
        );
    }

    @ExceptionHandler(LoyaltyRankNameAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleLoyaltyRankNameAlreadyExists(
            LoyaltyRankNameAlreadyExistsException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("LOYALTY_RANK_NAME_ALREADY_EXISTS", exception.getMessage())
        );
    }

    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<ApiError> handleVehicleNotFound(
            VehicleNotFoundException exception
    ) {
        ApiError error = new ApiError(
                "VEHICLE_NOT_FOUND",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<ApiError> handleScheduleNotFound(
            ScheduleNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("SCHEDULE_NOT_FOUND", exception.getMessage())
        );
    }

    @ExceptionHandler(ScheduleOverlapException.class)
    public ResponseEntity<ApiError> handleScheduleOverlap(
            ScheduleOverlapException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("SCHEDULE_OVERLAP", exception.getMessage())
        );
    }

    @ExceptionHandler(PartNotFoundException.class)
    public ResponseEntity<ApiError> handlePartNotFound(
            PartNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("PART_NOT_FOUND", exception.getMessage())
        );
    }

    @ExceptionHandler(PartNumberAlreadyExistsException.class)
    public ResponseEntity<ApiError> handlePartNumberAlreadyExists(
            PartNumberAlreadyExistsException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("PART_NUMBER_ALREADY_EXISTS", exception.getMessage())
        );
    }

    @ExceptionHandler(LicensePlateAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleLicensePlateAlreadyExists(
            LicensePlateAlreadyExistsException exception
    ) {
        ApiError error = new ApiError(
                "LICENSE_PLATE_ALREADY_EXISTS",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(error);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception
    ) {
        ApiError error = new ApiError(
                "EMAIL_ALREADY_EXISTS",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(
            InvalidCredentialsException exception
    ) {
        ApiError error = new ApiError(
                "INVALID_CREDENTIALS",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(error);
    }

    @ExceptionHandler(PhoneAlreadyExistsException.class)
    public ResponseEntity<ApiError> handlePhoneAlreadyExists(
            PhoneAlreadyExistsException exception
    ) {
        ApiError error = new ApiError(
                "PHONE_ALREADY_EXISTS",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(
            IllegalStateException exception
    ) {
        ApiError error = new ApiError(
                "SLOT_HELD_BY_ANOTHER",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException exception
    ) {
        ApiError error = new ApiError(
                "VALIDATION_ERROR",
                exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        String message = exception
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(fieldError ->
                        fieldError.getDefaultMessage()
                )
                .orElse("The request is invalid.");

        ApiError error = new ApiError(
                "VALIDATION_ERROR",
                message
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableRequest(
            HttpMessageNotReadableException exception
    ) {
        ApiError error = new ApiError(
                "VALIDATION_ERROR",
                "The request contains an invalid value."
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }
}
