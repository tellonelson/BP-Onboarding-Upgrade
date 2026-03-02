package com.onboarding.cigmsasponboardingupgradecustomer.domain.dto;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteUpdateRequestDTO {
    private String nombre;
    private String identificacion;
    @Positive(message = "La edad debe ser mayor a cero y no puede ser negativa")
    private Integer edad;
    private GeneroEnum genero;
    private String telefono;
    private String direccion;
    private String contrasena;
    private Boolean estado;
}
