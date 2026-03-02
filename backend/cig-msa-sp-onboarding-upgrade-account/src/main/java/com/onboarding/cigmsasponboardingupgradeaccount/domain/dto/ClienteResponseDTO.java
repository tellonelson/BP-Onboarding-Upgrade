package com.onboarding.cigmsasponboardingupgradeaccount.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResponseDTO {

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
