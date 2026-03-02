package com.onboarding.cigmsasponboardingupgrademovement.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.onboarding.cigmsasponboardingupgrademovement.domain.enums.TipoMovimiento;

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
public class MovimientoResponseDTO {

    private Long movimientoId;
    private LocalDateTime fecha;
    private TipoMovimiento tipoMovimiento;
    private BigDecimal valor;
    private BigDecimal saldo;
    private CuentaDTO cuenta;
}
