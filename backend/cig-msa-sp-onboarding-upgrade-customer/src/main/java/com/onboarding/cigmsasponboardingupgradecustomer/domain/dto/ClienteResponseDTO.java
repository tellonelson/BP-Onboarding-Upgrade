package com.onboarding.cigmsasponboardingupgradecustomer.domain.dto;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteResponseDTO {
    private Long id;
    private String nombre;
    private String identificacion;
    private Integer edad;
    private GeneroEnum genero;
    private String telefono;
    private String direccion;
    private String contrasena;
    private Boolean estado;
}
