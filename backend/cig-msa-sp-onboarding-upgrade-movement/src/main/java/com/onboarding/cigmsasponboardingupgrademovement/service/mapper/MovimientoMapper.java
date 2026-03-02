package com.onboarding.cigmsasponboardingupgrademovement.service.mapper;

import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.CuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.entity.Movimiento;

import org.springframework.stereotype.Component;

@Component
public class MovimientoMapper {

    public Movimiento toEntity(MovimientoRequestDTO dto) {
        return Movimiento.builder()
                .cuentaId(dto.getCuentaId())
                .fecha(dto.getFecha().atStartOfDay())
                .tipoMovimiento(dto.getTipoMovimiento())
                .valor(dto.getValor())
                .build();
    }

    public MovimientoResponseDTO toResponseDTO(Movimiento entity, CuentaDTO cuenta) {
        return MovimientoResponseDTO.builder()
                .movimientoId(entity.getMovimientoId())
                .fecha(entity.getFecha())
                .tipoMovimiento(entity.getTipoMovimiento())
                .valor(entity.getValor())
                .saldo(entity.getSaldo())
                .cuenta(cuenta)
                .build();
    }
}
