package com.onboarding.cigmsasponboardingupgradeaccount.domain.dto;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.enums.TypeEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentaUpdateDTO {

    private Long clienteId;

    @Size(max = 100, message = "El número de cuenta no puede exceder 100 caracteres")
    private String numeroCuenta;

    private TypeEnum tipoCuenta;

    @DecimalMin(value = "0.0", message = "El saldo inicial no puede ser negativo")
    private BigDecimal saldoInicial;

    private Boolean estado;
}
