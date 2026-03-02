package com.onboarding.cigmsasponboardingupgradecustomer.service.impl;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.Cliente;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.exception.ClienteException;
import com.onboarding.cigmsasponboardingupgradecustomer.repository.ClienteRepository;
import com.onboarding.cigmsasponboardingupgradecustomer.service.IClienteService;
import com.onboarding.cigmsasponboardingupgradecustomer.service.mapper.ClienteMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements IClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> getAllClientes() {
        log.debug("Request to get all Clientes");
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO getClienteById(Long id) {
        log.debug("Request to get Cliente : {}", id);
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteException("Cliente no encontrado con el ID: " + id,
                        org.springframework.http.HttpStatus.NOT_FOUND));
        return clienteMapper.toDto(cliente);
    }

    @Override
    @Transactional
    public ClienteResponseDTO createCliente(ClienteRequestDTO clienteDTO) {
        log.debug("Request to save Cliente : {}", clienteDTO);

        clienteRepository.findByIdentificacion(clienteDTO.getIdentificacion())
                .ifPresent(c -> {
                    throw new ClienteException(
                            "No fue posible procesar el registro con la identificación proporcionada",
                            org.springframework.http.HttpStatus.BAD_REQUEST, "identificacion");
                });

        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        Cliente savedCliente = clienteRepository.save(cliente);
        return clienteMapper.toDto(savedCliente);
    }

    @Override
    @Transactional
    public ClienteResponseDTO updateCliente(Long id, ClienteUpdateRequestDTO clienteDTO) {
        log.debug("Request to update Cliente : {}", id);
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteException("Cliente no encontrado con el ID: " + id,
                        org.springframework.http.HttpStatus.NOT_FOUND));

        if (Boolean.FALSE.equals(cliente.getEstado())) {
            if (!Boolean.TRUE.equals(clienteDTO.getEstado())) {
                throw new ClienteException(
                        "No se puede actualizar un cliente inactivo. Para actualizar, primero debe activar el cliente enviando estado=true",
                        org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        }

        if (clienteDTO.getIdentificacion() != null) {
            clienteRepository.findByIdentificacion(clienteDTO.getIdentificacion())
                    .filter(c -> !c.getClienteId().equals(id))
                    .ifPresent(c -> {
                        throw new ClienteException(
                                "No fue posible procesar el registro con la identificación proporcionada",
                                org.springframework.http.HttpStatus.BAD_REQUEST, "identificacion");
                    });
        }

        clienteMapper.updateEntityFromDtoPartial(clienteDTO, cliente);
        Cliente updatedCliente = clienteRepository.save(cliente);

        return clienteMapper.toDto(updatedCliente);
    }

    @Override
    @Transactional
    public void deleteCliente(Long id) {
        log.debug("Request to delete Cliente : {}", id);
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteException("Cliente no encontrado con el ID: " + id,
                        org.springframework.http.HttpStatus.NOT_FOUND));

        cliente.setEstado(false); // Eliminación lógica
        clienteRepository.save(cliente);
        // O clienteRepository.delete(cliente) para eliminación física.
    }
}
