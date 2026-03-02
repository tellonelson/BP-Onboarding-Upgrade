package com.onboarding.cigmsasponboardingupgrademovement.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.onboarding.cigmsasponboardingupgrademovement.domain.enums.TipoMovimiento;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class MovimientoRequestDTO {

    @NotNull(message = "El ID de cuenta es obligatorio")
    private Long cuentaId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipoMovimiento;

    @NotNull(message = "El valor es obligatorio")
    @Positive(message = "El valor debe ser mayor a cero")
    private BigDecimal valor;
}
