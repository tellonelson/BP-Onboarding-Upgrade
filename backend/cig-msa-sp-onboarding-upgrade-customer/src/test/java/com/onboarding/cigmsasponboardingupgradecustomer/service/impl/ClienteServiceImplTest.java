package com.onboarding.cigmsasponboardingupgradecustomer.service.impl;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.Cliente;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import com.onboarding.cigmsasponboardingupgradecustomer.exception.ClienteException;
import com.onboarding.cigmsasponboardingupgradecustomer.repository.ClienteRepository;
import com.onboarding.cigmsasponboardingupgradecustomer.service.mapper.ClienteMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceImplTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ClienteMapper clienteMapper;

    @InjectMocks
    private ClienteServiceImpl clienteService;

    private Cliente cliente;
    private ClienteUpdateRequestDTO updateDTO;
    private ClienteResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setClienteId(1L);
        cliente.setNombre("Juan Perez");
        cliente.setIdentificacion("1234567890");
        cliente.setEdad(30);
        cliente.setGenero(GeneroEnum.MASCULINO);
        cliente.setTelefono("0999999999");
        cliente.setDireccion("Av. Principal 123");
        cliente.setContrasena("password123");
        cliente.setEstado(true);

        updateDTO = new ClienteUpdateRequestDTO();

        responseDTO = new ClienteResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setNombre("Juan Perez");
        responseDTO.setEstado(true);
    }

    @Test
    void updateCliente_shouldUpdateSuccessfully_whenClienteIsActive() {
        // Given
        updateDTO.setNombre("Carlos Lopez");
        updateDTO.setEdad(25);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
        when(clienteMapper.toDto(any(Cliente.class))).thenReturn(responseDTO);

        // When
        ClienteResponseDTO result = clienteService.updateCliente(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(clienteRepository).findById(1L);
        verify(clienteMapper).updateEntityFromDtoPartial(updateDTO, cliente);
        verify(clienteRepository).save(cliente);
        verify(clienteMapper).toDto(cliente);
    }

    @Test
    void updateCliente_shouldAllowUpdate_whenClienteIsInactiveButEstadoTrueIsSent() {
        // Given
        cliente.setEstado(false); // Cliente inactivo
        updateDTO.setNombre("Carlos Lopez");
        updateDTO.setEstado(true); // Enviando estado=true para reactivar

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
        when(clienteMapper.toDto(any(Cliente.class))).thenReturn(responseDTO);

        // When
        ClienteResponseDTO result = clienteService.updateCliente(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(clienteRepository).findById(1L);
        verify(clienteMapper).updateEntityFromDtoPartial(updateDTO, cliente);
        verify(clienteRepository).save(cliente);
    }

    @Test
    void updateCliente_shouldThrowException_whenClienteIsInactiveAndEstadoIsNotSent() {
        // Given
        cliente.setEstado(false); // Cliente inactivo
        updateDTO.setNombre("Carlos Lopez");
        // No se envía estado (queda null)

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        // When - Then
        assertThatThrownBy(() -> clienteService.updateCliente(1L, updateDTO))
                .isInstanceOf(ClienteException.class)
                .hasMessageContaining("No se puede actualizar un cliente inactivo")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);

        verify(clienteRepository).findById(1L);
        verify(clienteMapper, never()).updateEntityFromDtoPartial(any(), any());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void updateCliente_shouldThrowException_whenClienteIsInactiveAndEstadoFalseIsSent() {
        // Given
        cliente.setEstado(false); // Cliente inactivo
        updateDTO.setNombre("Carlos Lopez");
        updateDTO.setEstado(false); // Enviando estado=false

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        // When - Then
        assertThatThrownBy(() -> clienteService.updateCliente(1L, updateDTO))
                .isInstanceOf(ClienteException.class)
                .hasMessageContaining("No se puede actualizar un cliente inactivo")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);

        verify(clienteRepository).findById(1L);
        verify(clienteMapper, never()).updateEntityFromDtoPartial(any(), any());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void updateCliente_shouldThrowException_whenClienteNotFound() {
        // Given
        when(clienteRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When - Then
        assertThatThrownBy(() -> clienteService.updateCliente(999L, updateDTO))
                .isInstanceOf(ClienteException.class)
                .hasMessageContaining("Cliente no encontrado con el ID: 999")
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);

        verify(clienteRepository).findById(999L);
        verify(clienteMapper, never()).updateEntityFromDtoPartial(any(), any());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void updateCliente_shouldThrowException_whenIdentificacionIsDuplicated() {
        // Given
        Cliente otroCliente = new Cliente();
        otroCliente.setClienteId(2L);
        otroCliente.setIdentificacion("0987654321");

        updateDTO.setIdentificacion("0987654321"); // Identificación que ya existe

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteRepository.findByIdentificacion("0987654321")).thenReturn(Optional.of(otroCliente));

        // When - Then
        assertThatThrownBy(() -> clienteService.updateCliente(1L, updateDTO))
                .isInstanceOf(ClienteException.class)
                .hasMessageContaining("No fue posible procesar el registro con la identificación proporcionada")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);

        verify(clienteRepository).findById(1L);
        verify(clienteRepository).findByIdentificacion("0987654321");
        verify(clienteMapper, never()).updateEntityFromDtoPartial(any(), any());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void updateCliente_shouldAllowUpdate_whenIdentificacionBelongsToSameCliente() {
        // Given
        updateDTO.setIdentificacion("1234567890"); // Misma identificación del cliente

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteRepository.findByIdentificacion("1234567890")).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
        when(clienteMapper.toDto(any(Cliente.class))).thenReturn(responseDTO);

        // When
        ClienteResponseDTO result = clienteService.updateCliente(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(clienteRepository).findById(1L);
        verify(clienteRepository).findByIdentificacion("1234567890");
        verify(clienteMapper).updateEntityFromDtoPartial(updateDTO, cliente);
        verify(clienteRepository).save(cliente);
    }

    @Test
    void updateCliente_shouldNotCheckIdentificacion_whenIdentificacionIsNotSent() {
        // Given
        updateDTO.setNombre("Carlos Lopez");
        // No se envía identificación

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
        when(clienteMapper.toDto(any(Cliente.class))).thenReturn(responseDTO);

        // When
        ClienteResponseDTO result = clienteService.updateCliente(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(clienteRepository).findById(1L);
        verify(clienteRepository, never()).findByIdentificacion(anyString());
        verify(clienteMapper).updateEntityFromDtoPartial(updateDTO, cliente);
        verify(clienteRepository).save(cliente);
    }
}
