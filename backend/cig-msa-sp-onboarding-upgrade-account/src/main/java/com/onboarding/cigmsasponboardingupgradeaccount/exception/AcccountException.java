package com.onboarding.cigmsasponboardingupgradeaccount.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class AcccountException extends RuntimeException {

    private final HttpStatus status;
    private final String field;

    public AcccountException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.field = null;
    }

    public AcccountException(String message, HttpStatus status, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }
}
