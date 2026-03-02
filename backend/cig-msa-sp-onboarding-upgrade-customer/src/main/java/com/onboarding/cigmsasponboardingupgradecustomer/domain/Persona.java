package com.onboarding.cigmsasponboardingupgradecustomer.domain;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class Persona {

    @Column(unique = true, length = 100)
    private String identificacion;

    @Column(length = 200)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(length = 100)
    private GeneroEnum genero;

    private Integer edad;

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String telefono;
}
