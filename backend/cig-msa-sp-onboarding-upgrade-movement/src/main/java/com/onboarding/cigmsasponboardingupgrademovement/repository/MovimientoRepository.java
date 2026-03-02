package com.onboarding.cigmsasponboardingupgrademovement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onboarding.cigmsasponboardingupgrademovement.domain.entity.Movimiento;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByCuentaId(Long cuentaId);

    List<Movimiento> findByCuentaIdOrderByFechaAsc(Long cuentaId);
}
