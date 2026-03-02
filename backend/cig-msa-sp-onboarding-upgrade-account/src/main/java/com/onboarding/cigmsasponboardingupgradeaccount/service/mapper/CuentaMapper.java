package com.onboarding.cigmsasponboardingupgradeaccount.service.mapper;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.Cuenta;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class CuentaMapper {

    public Cuenta toEntity(CuentaRequestDTO dto) {
        Cuenta cuenta = new Cuenta();
        cuenta.setClienteId(dto.getClienteId());
        cuenta.setNumeroCuenta(dto.getNumeroCuenta());
        cuenta.setTipoCuenta(dto.getTipoCuenta());
        cuenta.setSaldoInicial(dto.getSaldoInicial());
        return cuenta;
    }

    public CuentaResponseDTO toResponseDTO(Cuenta cuenta, ClienteResponseDTO cliente) {
        CuentaResponseDTO dto = new CuentaResponseDTO();
        dto.setCuentaId(cuenta.getCuentaId());
        dto.setNumeroCuenta(cuenta.getNumeroCuenta());
        dto.setTipoCuenta(cuenta.getTipoCuenta());
        dto.setSaldoInicial(cuenta.getSaldoInicial());
        dto.setCliente(cliente);
        return dto;
    }
}
