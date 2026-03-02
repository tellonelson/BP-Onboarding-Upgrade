package com.onboarding.cigmsasponboardingupgrademovement.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDTO {

    private Long id;
    private String nombre;
    private String identificacion;
    private Integer edad;
    private String genero;
    private String telefono;
    private String direccion;
    private String contrasena;
    private Boolean estado;
}
