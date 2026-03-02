package com.onboarding.cigmsasponboardingupgradecustomer.service.mapper;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.Cliente;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;

import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(dto.getNombre());
        cliente.setIdentificacion(dto.getIdentificacion());
        cliente.setEdad(dto.getEdad());
        cliente.setGenero(dto.getGenero());
        cliente.setTelefono(dto.getTelefono());
        cliente.setDireccion(dto.getDireccion());
        cliente.setContrasena(dto.getContrasena());
        cliente.setEstado(dto.getEstado());

        return cliente;
    }

    public ClienteResponseDTO toDto(Cliente entity) {
        if (entity == null) {
            return null;
        }

        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setId(entity.getClienteId());
        dto.setNombre(entity.getNombre());
        dto.setIdentificacion(entity.getIdentificacion());
        dto.setEdad(entity.getEdad());
        dto.setGenero(entity.getGenero());
        dto.setTelefono(entity.getTelefono());
        dto.setDireccion(entity.getDireccion());
        dto.setContrasena(entity.getContrasena());
        dto.setEstado(entity.getEstado());

        return dto;
    }

    public void updateEntityFromDto(ClienteRequestDTO dto, Cliente entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setNombre(dto.getNombre());
        entity.setIdentificacion(dto.getIdentificacion());
        entity.setEdad(dto.getEdad());
        entity.setGenero(dto.getGenero());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());
        entity.setContrasena(dto.getContrasena());
        entity.setEstado(dto.getEstado());
    }

    public void updateEntityFromDtoPartial(ClienteUpdateRequestDTO dto, Cliente entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getIdentificacion() != null) {
            entity.setIdentificacion(dto.getIdentificacion());
        }
        if (dto.getEdad() != null) {
            entity.setEdad(dto.getEdad());
        }
        if (dto.getGenero() != null) {
            entity.setGenero(dto.getGenero());
        }
        if (dto.getTelefono() != null) {
            entity.setTelefono(dto.getTelefono());
        }
        if (dto.getDireccion() != null) {
            entity.setDireccion(dto.getDireccion());
        }
        if (dto.getContrasena() != null) {
            entity.setContrasena(dto.getContrasena());
        }
        if (dto.getEstado() != null) {
            entity.setEstado(dto.getEstado());
        }
    }
}
