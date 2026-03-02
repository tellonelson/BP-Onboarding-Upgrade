package com.onboarding.cigmsasponboardingupgradecustomer.repository;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByIdentificacion(String identificacion);
}
