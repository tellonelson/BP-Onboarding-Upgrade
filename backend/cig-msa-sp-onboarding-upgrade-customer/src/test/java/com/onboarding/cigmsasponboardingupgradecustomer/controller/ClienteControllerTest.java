package com.onboarding.cigmsasponboardingupgradecustomer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.dto.ClienteUpdateRequestDTO;
import com.onboarding.cigmsasponboardingupgradecustomer.domain.enums.GeneroEnum;
import com.onboarding.cigmsasponboardingupgradecustomer.exception.ClienteException;
import com.onboarding.cigmsasponboardingupgradecustomer.exception.GlobalExceptionHandler;
import com.onboarding.cigmsasponboardingupgradecustomer.service.IClienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
@Import(GlobalExceptionHandler.class)
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IClienteService clienteService;

    private ClienteUpdateRequestDTO updateDTO;
    private ClienteResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        updateDTO = new ClienteUpdateRequestDTO();
        updateDTO.setNombre("Carlos Lopez");
        updateDTO.setEdad(25);

        responseDTO = new ClienteResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setNombre("Carlos Lopez");
        responseDTO.setIdentificacion("1234567890");
        responseDTO.setEdad(25);
        responseDTO.setGenero(GeneroEnum.MASCULINO);
        responseDTO.setTelefono("0999999999");
        responseDTO.setDireccion("Av. Principal 123");
        responseDTO.setContrasena("password123");
        responseDTO.setEstado(true);
    }

    @Test
    void updateCliente_shouldReturnOk_whenUpdateIsSuccessful() throws Exception {
        // Given
        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenReturn(responseDTO);

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.nombre", is("Carlos Lopez")))
                .andExpect(jsonPath("$.edad", is(25)))
                .andExpect(jsonPath("$.estado", is(true)));
    }

    @Test
    void updateCliente_shouldReturnOk_whenOnlyOneFieldIsUpdated() throws Exception {
        // Given
        ClienteUpdateRequestDTO partialUpdateDTO = new ClienteUpdateRequestDTO();
        partialUpdateDTO.setNombre("Pedro Gonzalez");

        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenReturn(responseDTO);

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialUpdateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void updateCliente_shouldReturnOk_whenReactivatingInactiveCliente() throws Exception {
        // Given
        ClienteUpdateRequestDTO reactivationDTO = new ClienteUpdateRequestDTO();
        reactivationDTO.setNombre("Carlos Lopez");
        reactivationDTO.setEstado(true); // Reactivando

        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenReturn(responseDTO);

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reactivationDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado", is(true)));
    }

    @Test
    void updateCliente_shouldReturnBadRequest_whenClienteIsInactive() throws Exception {
        // Given
        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenThrow(new ClienteException(
                        "No se puede actualizar un cliente inactivo. Para actualizar, primero debe activar el cliente enviando estado=true",
                        HttpStatus.BAD_REQUEST));

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("No se puede actualizar un cliente inactivo")));
    }

    @Test
    void updateCliente_shouldReturnNotFound_whenClienteDoesNotExist() throws Exception {
        // Given
        when(clienteService.updateCliente(eq(999L), any(ClienteUpdateRequestDTO.class)))
                .thenThrow(new ClienteException("Cliente no encontrado con el ID: 999", HttpStatus.NOT_FOUND));

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Cliente no encontrado")));
    }

    @Test
    void updateCliente_shouldReturnBadRequest_whenIdentificacionIsDuplicated() throws Exception {
        // Given
        ClienteUpdateRequestDTO duplicatedDTO = new ClienteUpdateRequestDTO();
        duplicatedDTO.setIdentificacion("0987654321");

        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenThrow(new ClienteException(
                        "No fue posible procesar el registro con la identificación proporcionada",
                        HttpStatus.BAD_REQUEST,
                        "identificacion"));

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicatedDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Error de validación en la petición")))
                .andExpect(jsonPath("$.details.identificacion").value(org.hamcrest.Matchers.containsString("identificación proporcionada")));
    }

    @Test
    void updateCliente_shouldReturnBadRequest_whenEdadIsNegative() throws Exception {
        // Given
        ClienteUpdateRequestDTO invalidDTO = new ClienteUpdateRequestDTO();
        invalidDTO.setEdad(-5); // Edad negativa

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Error de validación en la petición")))
                .andExpect(jsonPath("$.details.edad").value(org.hamcrest.Matchers.containsString("mayor a cero")));
    }

    @Test
    void updateCliente_shouldReturnBadRequest_whenEdadIsZero() throws Exception {
        // Given
        ClienteUpdateRequestDTO invalidDTO = new ClienteUpdateRequestDTO();
        invalidDTO.setEdad(0); // Edad cero

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Error de validación en la petición")))
                .andExpect(jsonPath("$.details.edad").value(org.hamcrest.Matchers.containsString("mayor a cero")));
    }

    @Test
    void updateCliente_shouldReturnOk_whenAllFieldsAreUpdated() throws Exception {
        // Given
        ClienteUpdateRequestDTO fullUpdateDTO = new ClienteUpdateRequestDTO();
        fullUpdateDTO.setNombre("Maria Garcia");
        fullUpdateDTO.setIdentificacion("0987654321");
        fullUpdateDTO.setEdad(28);
        fullUpdateDTO.setGenero(GeneroEnum.FEMENINO);
        fullUpdateDTO.setTelefono("0988888888");
        fullUpdateDTO.setDireccion("Calle Secundaria 456");
        fullUpdateDTO.setContrasena("newpassword");
        fullUpdateDTO.setEstado(true);

        when(clienteService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenReturn(responseDTO);

        // When - Then
        mockMvc.perform(put("/clientes/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fullUpdateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
