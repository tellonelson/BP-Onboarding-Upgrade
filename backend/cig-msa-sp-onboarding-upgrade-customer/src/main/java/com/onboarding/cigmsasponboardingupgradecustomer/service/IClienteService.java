package com.onboarding.cigmsasponboardingupgradecustomer.service;

import java.util.List;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;

public interface IClienteService {
    List<ClienteResponseDTO> getAllClientes();

    ClienteResponseDTO getClienteById(Long id);

    ClienteResponseDTO createCliente(ClienteRequestDTO clienteDTO);

    ClienteResponseDTO updateCliente(Long id, ClienteUpdateRequestDTO clienteDTO);

    void deleteCliente(Long id);
}
