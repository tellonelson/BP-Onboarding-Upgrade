package com.onboarding.cigmsasponboardingupgrademovement.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.CuentaDTO;

@FeignClient(name = "cuenta-service", url = "${account.service.url}")
public interface CuentaClient {

    @GetMapping("/cuentas/{id}")
    CuentaDTO getCuentaById(@PathVariable Long id);

    @GetMapping("/cuentas")
    List<CuentaDTO> getAllCuentas();
}
