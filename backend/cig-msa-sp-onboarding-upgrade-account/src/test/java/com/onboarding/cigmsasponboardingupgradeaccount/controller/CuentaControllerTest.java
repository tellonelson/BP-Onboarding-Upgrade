package com.onboarding.cigmsasponboardingupgradeaccount.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaUpdateDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.enums.TypeEnum;
import com.onboarding.cigmsasponboardingupgradeaccount.exception.AcccountException;
import com.onboarding.cigmsasponboardingupgradeaccount.service.CuentaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CuentaController.class)
class CuentaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CuentaService cuentaService;

    @Autowired
    private ObjectMapper objectMapper;

    private CuentaResponseDTO responseDTO;
    private ClienteResponseDTO clienteDTO;

    @BeforeEach
    void setUp() {
        clienteDTO = new ClienteResponseDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", true);
        responseDTO = new CuentaResponseDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"), clienteDTO);
    }

    @Nested
    @DisplayName("POST /cuentas")
    class CrearTests {

        @Test
        @DisplayName("Debe crear una cuenta y retornar 201")
        void crearCuentaExitosamente() throws Exception {
            CuentaRequestDTO request = new CuentaRequestDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"));
            when(cuentaService.crear(any(CuentaRequestDTO.class))).thenReturn(responseDTO);

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.cuentaId").value(1))
                    .andExpect(jsonPath("$.numeroCuenta").value("1234567890"))
                    .andExpect(jsonPath("$.tipoCuenta").value("AHORROS"))
                    .andExpect(jsonPath("$.saldoInicial").value(1000.0000))
                    .andExpect(jsonPath("$.cliente.nombre").value("Juan Perez"));
        }

        @Test
        @DisplayName("Debe retornar 400 cuando clienteId es null")
        void crearCuentaSinClienteId() throws Exception {
            CuentaRequestDTO request = new CuentaRequestDTO(null, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"));

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando numeroCuenta es blank")
        void crearCuentaSinNumeroCuenta() throws Exception {
            CuentaRequestDTO request = new CuentaRequestDTO(1L, "", TypeEnum.AHORROS, new BigDecimal("1000.0000"));

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando tipoCuenta es null")
        void crearCuentaSinTipoCuenta() throws Exception {
            CuentaRequestDTO request = new CuentaRequestDTO(1L, "1234567890", null, new BigDecimal("1000.0000"));

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando saldoInicial es negativo")
        void crearCuentaSaldoNegativo() throws Exception {
            CuentaRequestDTO request = new CuentaRequestDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("-100.00"));

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando el body es JSON invalido")
        void crearCuentaJsonInvalido() throws Exception {
            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando tipoCuenta tiene valor invalido")
        void crearCuentaTipoCuentaInvalido() throws Exception {
            String json = "{\"clienteId\":1,\"numeroCuenta\":\"123\",\"tipoCuenta\":\"INVALIDO\",\"saldoInicial\":1000}";

            mockMvc.perform(post("/cuentas")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /cuentas")
    class ListarTodasTests {

        @Test
        @DisplayName("Debe listar todas las cuentas y retornar 200")
        void listarTodasExitosamente() throws Exception {
            when(cuentaService.listarTodas()).thenReturn(List.of(responseDTO));

            mockMvc.perform(get("/cuentas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].cuentaId").value(1))
                    .andExpect(jsonPath("$[0].numeroCuenta").value("1234567890"));
        }

        @Test
        @DisplayName("Debe retornar lista vacia con 200")
        void listarTodasVacia() throws Exception {
            when(cuentaService.listarTodas()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/cuentas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /cuentas/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe obtener cuenta por id y retornar 200")
        void obtenerPorIdExitosamente() throws Exception {
            when(cuentaService.obtenerPorId(1L)).thenReturn(responseDTO);

            mockMvc.perform(get("/cuentas/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cuentaId").value(1))
                    .andExpect(jsonPath("$.numeroCuenta").value("1234567890"))
                    .andExpect(jsonPath("$.cliente.nombre").value("Juan Perez"));
        }

        @Test
        @DisplayName("Debe retornar 404 cuando la cuenta no existe")
        void obtenerPorIdNoExiste() throws Exception {
            when(cuentaService.obtenerPorId(99L))
                    .thenThrow(new AcccountException("Cuenta no encontrada con id: 99", HttpStatus.NOT_FOUND));

            mockMvc.perform(get("/cuentas/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /cuentas/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar una cuenta y retornar 200")
        void actualizarExitosamente() throws Exception {
            CuentaUpdateDTO updateRequest = new CuentaUpdateDTO(null, "9999999999", TypeEnum.CORRIENTE, new BigDecimal("5000.0000"));
            CuentaResponseDTO updatedResponse = new CuentaResponseDTO(1L, "9999999999", TypeEnum.CORRIENTE, new BigDecimal("5000.0000"), clienteDTO);

            when(cuentaService.actualizar(eq(1L), any(CuentaUpdateDTO.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/cuentas/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.numeroCuenta").value("9999999999"))
                    .andExpect(jsonPath("$.tipoCuenta").value("CORRIENTE"));
        }

        @Test
        @DisplayName("Debe retornar 404 cuando la cuenta a actualizar no existe")
        void actualizarNoExiste() throws Exception {
            CuentaUpdateDTO updateRequest = new CuentaUpdateDTO(null, null, null, new BigDecimal("2000.0000"));

            when(cuentaService.actualizar(eq(99L), any(CuentaUpdateDTO.class)))
                    .thenThrow(new AcccountException("Cuenta no encontrada con id: 99", HttpStatus.NOT_FOUND));

            mockMvc.perform(put("/cuentas/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Debe retornar 409 cuando el numero de cuenta ya esta en uso")
        void actualizarNumeroCuentaDuplicado() throws Exception {
            CuentaUpdateDTO updateRequest = new CuentaUpdateDTO(null, "DUPLICADO", null, null);

            when(cuentaService.actualizar(eq(1L), any(CuentaUpdateDTO.class)))
                    .thenThrow(new AcccountException("El número de cuenta ya está en uso", HttpStatus.CONFLICT, "numeroCuenta"));

            mockMvc.perform(put("/cuentas/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("DELETE /cuentas/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar una cuenta y retornar 204")
        void eliminarExitosamente() throws Exception {
            doNothing().when(cuentaService).eliminar(1L);

            mockMvc.perform(delete("/cuentas/1"))
                    .andExpect(status().isNoContent());

            verify(cuentaService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar 404 cuando la cuenta a eliminar no existe")
        void eliminarNoExiste() throws Exception {
            doThrow(new AcccountException("Cuenta no encontrada con id: 99", HttpStatus.NOT_FOUND))
                    .when(cuentaService).eliminar(99L);

            mockMvc.perform(delete("/cuentas/99"))
                    .andExpect(status().isNotFound());
        }
    }
}
