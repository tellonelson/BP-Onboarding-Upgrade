package com.onboarding.cigmsasponboardingupgrademovement.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoCuentaDTO {

    private String numeroCuenta;
    private String tipoCuenta;
    private String nombreCliente;
    private BigDecimal saldoInicial;
    private BigDecimal credito;
    private BigDecimal debito;
    private BigDecimal saldo;
    private LocalDate ultimoMovimiento;
}
