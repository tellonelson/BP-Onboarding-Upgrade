package com.onboarding.cigmsasponboardingupgrademovement.service;

import java.util.List;

import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.EstadoCuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;

public interface MovimientoService {

    MovimientoResponseDTO crear(MovimientoRequestDTO request);

    MovimientoResponseDTO obtenerPorId(Long id);

    List<MovimientoResponseDTO> obtenerTodos();

    List<MovimientoResponseDTO> obtenerPorCuentaId(Long cuentaId);

    MovimientoResponseDTO actualizar(Long id, MovimientoRequestDTO request);

    void eliminar(Long id);

    List<EstadoCuentaDTO> obtenerEstadosCuenta();

    EstadoCuentaDTO obtenerEstadoCuentaPorCuentaId(Long cuentaId);
}
