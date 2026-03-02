package com.onboarding.cigmsasponboardingupgradecustomer.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class ClienteException extends RuntimeException {

    private final HttpStatus status;
    private final String field;

    public ClienteException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.field = null;
    }

    public ClienteException(String message, HttpStatus status, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }
}
