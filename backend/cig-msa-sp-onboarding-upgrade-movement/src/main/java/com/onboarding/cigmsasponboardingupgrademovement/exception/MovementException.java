package com.onboarding.cigmsasponboardingupgrademovement.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class MovementException extends RuntimeException {

    private final HttpStatus status;
    private final String field;

    public MovementException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.field = null;
    }

    public MovementException(String message, HttpStatus status, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }
}
