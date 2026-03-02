package com.onboarding.cigmsasponboardingupgradeaccount.client;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.ClienteResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cliente-service", url = "${cliente.service.url}")
public interface ClienteClient {

    @GetMapping("/clientes/{id}")
    ClienteResponseDTO getClienteById(@PathVariable Long id);
}
