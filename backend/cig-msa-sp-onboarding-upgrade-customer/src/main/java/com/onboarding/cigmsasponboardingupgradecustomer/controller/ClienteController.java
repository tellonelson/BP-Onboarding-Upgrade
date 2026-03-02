package com.onboarding.cigmsasponboardingupgradecustomer.controller;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.service.IClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(path = "/clientes", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class ClienteController {

    private final IClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> getAllClientes() {
        log.info("REST request to get all Clientes");
        return ResponseEntity.ok(clienteService.getAllClientes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> getClienteById(@PathVariable Long id) {
        log.info("REST request to get Cliente : {}", id);
        return ResponseEntity.ok(clienteService.getClienteById(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClienteResponseDTO> createCliente(@Valid @RequestBody ClienteRequestDTO clienteDTO) {
        log.info("REST request to save Cliente : {}", clienteDTO);
        ClienteResponseDTO result = clienteService.createCliente(clienteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClienteResponseDTO> updateCliente(
            @PathVariable Long id,
            @Valid @RequestBody ClienteUpdateRequestDTO clienteDTO) {
        log.info("REST request to update Cliente : {}, {}", id, clienteDTO);
        return ResponseEntity.ok(clienteService.updateCliente(id, clienteDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        log.info("REST request to delete Cliente : {}", id);
        clienteService.deleteCliente(id);
        return ResponseEntity.noContent().build();
    }
}
