package com.onboarding.cigmsasponboardingupgradecustomer.exception;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ClienteException.class)
    public ResponseEntity<ErrorResponse> handleClienteException(ClienteException ex, HttpServletRequest request) {
        log.warn("ClienteException: {}", ex.getMessage());

        Map<String, String> details = null;
        String message = ex.getMessage();

        if (ex.getField() != null) {
            details = new java.util.HashMap<>();
            details.put(ex.getField(), ex.getMessage());
            message = "Error de validación en la petición";
        }

        return buildErrorResponse(ex.getStatus(), message, request.getRequestURI(), details);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex,
            HttpServletRequest request) {
        log.error("DataIntegrityViolationException: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, "Violación de integridad de datos", request.getRequestURI(),
                null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        log.warn("HttpMessageNotReadableException: {}", ex.getMessage());

        Map<String, String> details = new java.util.HashMap<>();
        Throwable cause = ex.getCause();

        if (cause instanceof com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException unrecognizedEx) {
            String fieldName = unrecognizedEx.getPropertyName();
            details.put(fieldName, "El campo proporcionado no es reconocido por el sistema");
        } else if (cause instanceof com.fasterxml.jackson.databind.JsonMappingException jsonMappingEx) {
            String fieldName = jsonMappingEx.getPath().isEmpty() ? "desconocido"
                    : jsonMappingEx.getPath().get(0).getFieldName();

            if (cause instanceof InvalidFormatException invalidFormatEx && isGeneroEnum(invalidFormatEx)) {
                details.put(fieldName, "El valor proporcionado no es un género válido");
            } else {
                details.put(fieldName, "El formato del dato proporcionado es inválido o no soportado");
            }
        } else {
            details.put("error_detalle", "JSON mal formado o vacío");
        }

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Cuerpo de solicitud inválido", request.getRequestURI(),
                details);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        log.warn("MethodArgumentNotValidException: {}", ex.getMessage());

        Map<String, String> details = new java.util.HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> details.put(error.getField(), error.getDefaultMessage()));

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Error de validación en la petición", request.getRequestURI(),
                details);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled Exception: ", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor",
                request.getRequestURI(), null);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String message, String path,
            Map<String, String> details) {

        ErrorResponse body = ErrorResponse.of(status.value(), status.getReasonPhrase(), message, path, details);

        return ResponseEntity.status(status).body(body);
    }

    private boolean isGeneroEnum(InvalidFormatException ex) {
        return ex.getTargetType().equals(GeneroEnum.class);
    }

}
