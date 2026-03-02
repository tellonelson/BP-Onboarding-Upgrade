package com.onboarding.cigmsasponboardingupgradeaccount.repository;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    boolean existsByNumeroCuentaAndCuentaIdNot(String numeroCuenta, Long cuentaId);
}
