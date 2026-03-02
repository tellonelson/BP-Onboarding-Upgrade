package com.onboarding.cigmsasponboardingupgradecustomer.domain.dto;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteRequestDTO {
    @NotBlank(message = "El nombre es requerido")
    private String nombre;
    @NotBlank(message = "La identificación es requerida")
    private String identificacion;
    @Positive(message = "La edad debe ser mayor a cero y no puede ser negativa")
    @NotNull(message = "La edad es requerida")
    private Integer edad;
    @NotNull
    private GeneroEnum genero;
    private String telefono;
    private String direccion;
    @NotBlank
    private String contrasena;
    private Boolean estado = true;
}
