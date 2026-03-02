package com.onboarding.cigmsasponboardingupgradeaccount.service;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaUpdateDTO;

import java.util.List;

public interface CuentaService {

    CuentaResponseDTO crear(CuentaRequestDTO request);

    List<CuentaResponseDTO> listarTodas();

    CuentaResponseDTO obtenerPorId(Long id);

    CuentaResponseDTO actualizar(Long id, CuentaUpdateDTO request);

    void eliminar(Long id);
}
