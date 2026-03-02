package com.onboarding.cigmsasponboardingupgradeaccount.domain.dto;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.enums.TypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentaResponseDTO {

    private Long cuentaId;
    private String numeroCuenta;
    private TypeEnum tipoCuenta;
    private BigDecimal saldoInicial;
    private ClienteResponseDTO cliente;
}
