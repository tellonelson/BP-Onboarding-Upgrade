package com.onboarding.cigmsasponboardingupgradecustomer.service.mapper;

import com.onboarding.cigmsasponboardingupgradecustomer.domain.Cliente;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ClienteMapperTest {

    private ClienteMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ClienteMapper();
    }

    @Test
    void updateEntityFromDtoPartial_shouldUpdateOnlyNonNullFields() {
        // Given
        Cliente cliente = new Cliente();
        cliente.setClienteId(1L);
        cliente.setNombre("Juan Perez");
        cliente.setIdentificacion("1234567890");
        cliente.setEdad(30);
        cliente.setGenero(GeneroEnum.MASCULINO);
        cliente.setTelefono("0999999999");
        cliente.setDireccion("Av. Principal 123");
        cliente.setContrasena("password123");
        cliente.setEstado(true);

        ClienteUpdateRequestDTO dto = new ClienteUpdateRequestDTO();
        dto.setNombre("Carlos Lopez");
        dto.setEdad(25);
        // Los demás campos quedan null

        // When
        mapper.updateEntityFromDtoPartial(dto, cliente);

        // Then
        assertThat(cliente.getNombre()).isEqualTo("Carlos Lopez");
        assertThat(cliente.getEdad()).isEqualTo(25);
        // Campos no enviados deben mantener sus valores originales
        assertThat(cliente.getIdentificacion()).isEqualTo("1234567890");
        assertThat(cliente.getGenero()).isEqualTo(GeneroEnum.MASCULINO);
        assertThat(cliente.getTelefono()).isEqualTo("0999999999");
        assertThat(cliente.getDireccion()).isEqualTo("Av. Principal 123");
        assertThat(cliente.getContrasena()).isEqualTo("password123");
        assertThat(cliente.getEstado()).isTrue();
    }

    @Test
    void updateEntityFromDtoPartial_shouldUpdateAllFieldsWhenAllProvided() {
        // Given
        Cliente cliente = new Cliente();
        cliente.setClienteId(1L);
        cliente.setNombre("Juan Perez");
        cliente.setIdentificacion("1234567890");
        cliente.setEdad(30);
        cliente.setGenero(GeneroEnum.MASCULINO);
        cliente.setTelefono("0999999999");
        cliente.setDireccion("Av. Principal 123");
        cliente.setContrasena("password123");
        cliente.setEstado(true);

        ClienteUpdateRequestDTO dto = new ClienteUpdateRequestDTO();
        dto.setNombre("Maria Garcia");
        dto.setIdentificacion("0987654321");
        dto.setEdad(28);
        dto.setGenero(GeneroEnum.FEMENINO);
        dto.setTelefono("0988888888");
        dto.setDireccion("Calle Secundaria 456");
        dto.setContrasena("newpassword");
        dto.setEstado(false);

        // When
        mapper.updateEntityFromDtoPartial(dto, cliente);

        // Then
        assertThat(cliente.getNombre()).isEqualTo("Maria Garcia");
        assertThat(cliente.getIdentificacion()).isEqualTo("0987654321");
        assertThat(cliente.getEdad()).isEqualTo(28);
        assertThat(cliente.getGenero()).isEqualTo(GeneroEnum.FEMENINO);
        assertThat(cliente.getTelefono()).isEqualTo("0988888888");
        assertThat(cliente.getDireccion()).isEqualTo("Calle Secundaria 456");
        assertThat(cliente.getContrasena()).isEqualTo("newpassword");
        assertThat(cliente.getEstado()).isFalse();
    }

    @Test
    void updateEntityFromDtoPartial_shouldNotUpdateWhenDtoIsNull() {
        // Given
        Cliente cliente = new Cliente();
        cliente.setNombre("Juan Perez");
        cliente.setEdad(30);

        // When
        mapper.updateEntityFromDtoPartial(null, cliente);

        // Then
        assertThat(cliente.getNombre()).isEqualTo("Juan Perez");
        assertThat(cliente.getEdad()).isEqualTo(30);
    }

    @Test
    void updateEntityFromDtoPartial_shouldNotUpdateWhenEntityIsNull() {
        // Given
        ClienteUpdateRequestDTO dto = new ClienteUpdateRequestDTO();
        dto.setNombre("Carlos Lopez");

        // When - Then (no debe lanzar excepción)
        mapper.updateEntityFromDtoPartial(dto, null);
    }

    @Test
    void updateEntityFromDtoPartial_shouldUpdateOnlyEstadoField() {
        // Given
        Cliente cliente = new Cliente();
        cliente.setClienteId(1L);
        cliente.setNombre("Juan Perez");
        cliente.setIdentificacion("1234567890");
        cliente.setEdad(30);
        cliente.setGenero(GeneroEnum.MASCULINO);
        cliente.setEstado(false); // inactivo

        ClienteUpdateRequestDTO dto = new ClienteUpdateRequestDTO();
        dto.setEstado(true); // solo activar

        // When
        mapper.updateEntityFromDtoPartial(dto, cliente);

        // Then
        assertThat(cliente.getEstado()).isTrue();
        // Otros campos no cambian
        assertThat(cliente.getNombre()).isEqualTo("Juan Perez");
        assertThat(cliente.getIdentificacion()).isEqualTo("1234567890");
        assertThat(cliente.getEdad()).isEqualTo(30);
        assertThat(cliente.getGenero()).isEqualTo(GeneroEnum.MASCULINO);
    }
}
