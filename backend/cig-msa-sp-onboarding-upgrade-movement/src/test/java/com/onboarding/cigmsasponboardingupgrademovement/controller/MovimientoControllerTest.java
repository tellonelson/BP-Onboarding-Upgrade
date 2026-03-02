package com.onboarding.cigmsasponboardingupgrademovement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.ClienteDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.CuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.EstadoCuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.enums.TipoMovimiento;
import com.onboarding.cigmsasponboardingupgrademovement.exception.MovementException;
import com.onboarding.cigmsasponboardingupgrademovement.service.MovimientoService;
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
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MovimientoController.class)
class MovimientoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MovimientoService movimientoService;

    @Autowired
    private ObjectMapper objectMapper;

    private MovimientoResponseDTO responseDTO;
    private CuentaDTO cuentaDTO;
    private EstadoCuentaDTO estadoCuentaDTO;

    @BeforeEach
    void setUp() {
        ClienteDTO clienteDTO = new ClienteDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", true);
        cuentaDTO = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), true, clienteDTO);

        responseDTO = MovimientoResponseDTO.builder()
                .movimientoId(1L)
                .fecha(LocalDate.of(2026, 3, 1).atStartOfDay())
                .tipoMovimiento(TipoMovimiento.CREDITO)
                .valor(new BigDecimal("500.0000"))
                .saldo(new BigDecimal("1500.0000"))
                .cuenta(cuentaDTO)
                .build();

        estadoCuentaDTO = EstadoCuentaDTO.builder()
                .numeroCuenta("1234567890")
                .tipoCuenta("AHORROS")
                .nombreCliente("Juan Perez")
                .saldoInicial(new BigDecimal("1000.0000"))
                .credito(new BigDecimal("500.0000"))
                .debito(BigDecimal.ZERO)
                .saldo(new BigDecimal("1500.0000"))
                .ultimoMovimiento(LocalDate.of(2026, 3, 1))
                .build();
    }

    @Nested
    @DisplayName("POST /movimientos")
    class CrearTests {

        @Test
        @DisplayName("Debe crear un movimiento y retornar 201")
        void crearMovimientoExitosamente() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("500.0000"))
                    .build();

            when(movimientoService.crear(any(MovimientoRequestDTO.class))).thenReturn(responseDTO);

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.movimientoId").value(1))
                    .andExpect(jsonPath("$.tipoMovimiento").value("CREDITO"))
                    .andExpect(jsonPath("$.valor").value(500.0000))
                    .andExpect(jsonPath("$.saldo").value(1500.0000))
                    .andExpect(jsonPath("$.cuenta.numeroCuenta").value("1234567890"));
        }

        @Test
        @DisplayName("Debe retornar 400 cuando cuentaId es null")
        void crearSinCuentaId() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(null)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("500.0000"))
                    .build();

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando fecha es null")
        void crearSinFecha() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(null)
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("500.0000"))
                    .build();

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando tipoMovimiento es null")
        void crearSinTipoMovimiento() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(null)
                    .valor(new BigDecimal("500.0000"))
                    .build();

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando valor es negativo")
        void crearConValorNegativo() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("-100.00"))
                    .build();

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando saldo no es suficiente")
        void crearSaldoInsuficiente() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("5000.0000"))
                    .build();

            when(movimientoService.crear(any(MovimientoRequestDTO.class)))
                    .thenThrow(new MovementException("Saldo no disponible", HttpStatus.BAD_REQUEST, "valor"));

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando JSON es invalido")
        void crearJsonInvalido() throws Exception {
            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Debe retornar 400 cuando tipoMovimiento tiene valor invalido")
        void crearTipoMovimientoInvalido() throws Exception {
            String json = "{\"cuentaId\":1,\"fecha\":\"2026-03-01\",\"tipoMovimiento\":\"INVALIDO\",\"valor\":500}";

            mockMvc.perform(post("/movimientos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /movimientos/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe obtener movimiento por id y retornar 200")
        void obtenerPorIdExitosamente() throws Exception {
            when(movimientoService.obtenerPorId(1L)).thenReturn(responseDTO);

            mockMvc.perform(get("/movimientos/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.movimientoId").value(1))
                    .andExpect(jsonPath("$.tipoMovimiento").value("CREDITO"));
        }

        @Test
        @DisplayName("Debe retornar 404 cuando movimiento no existe")
        void obtenerPorIdNoExiste() throws Exception {
            when(movimientoService.obtenerPorId(99L))
                    .thenThrow(new MovementException("Movimiento no encontrado con ID: 99", HttpStatus.NOT_FOUND));

            mockMvc.perform(get("/movimientos/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /movimientos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe obtener todos los movimientos y retornar 200")
        void obtenerTodosExitosamente() throws Exception {
            when(movimientoService.obtenerTodos()).thenReturn(List.of(responseDTO));

            mockMvc.perform(get("/movimientos"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].movimientoId").value(1));
        }

        @Test
        @DisplayName("Debe retornar lista vacia con 200")
        void obtenerTodosVacia() throws Exception {
            when(movimientoService.obtenerTodos()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/movimientos"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /movimientos/cuenta/{cuentaId}")
    class ObtenerPorCuentaIdTests {

        @Test
        @DisplayName("Debe obtener movimientos por cuenta id y retornar 200")
        void obtenerPorCuentaIdExitosamente() throws Exception {
            when(movimientoService.obtenerPorCuentaId(1L)).thenReturn(List.of(responseDTO));

            mockMvc.perform(get("/movimientos/cuenta/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /movimientos/estado-cuenta")
    class EstadosCuentaTests {

        @Test
        @DisplayName("Debe obtener todos los estados de cuenta y retornar 200")
        void obtenerEstadosCuentaExitosamente() throws Exception {
            when(movimientoService.obtenerEstadosCuenta()).thenReturn(List.of(estadoCuentaDTO));

            mockMvc.perform(get("/movimientos/estado-cuenta"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].numeroCuenta").value("1234567890"))
                    .andExpect(jsonPath("$[0].nombreCliente").value("Juan Perez"))
                    .andExpect(jsonPath("$[0].saldo").value(1500.0000));
        }
    }

    @Nested
    @DisplayName("GET /movimientos/estado-cuenta/{cuentaId}")
    class EstadoCuentaPorIdTests {

        @Test
        @DisplayName("Debe obtener estado de cuenta por id y retornar 200")
        void obtenerEstadoCuentaPorIdExitosamente() throws Exception {
            when(movimientoService.obtenerEstadoCuentaPorCuentaId(1L)).thenReturn(estadoCuentaDTO);

            mockMvc.perform(get("/movimientos/estado-cuenta/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.numeroCuenta").value("1234567890"))
                    .andExpect(jsonPath("$.saldo").value(1500.0000));
        }
    }

    @Nested
    @DisplayName("PUT /movimientos/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar un movimiento y retornar 200")
        void actualizarExitosamente() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("700.0000"))
                    .build();

            when(movimientoService.actualizar(eq(1L), any(MovimientoRequestDTO.class))).thenReturn(responseDTO);

            mockMvc.perform(put("/movimientos/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.movimientoId").value(1));
        }

        @Test
        @DisplayName("Debe retornar 404 cuando movimiento a actualizar no existe")
        void actualizarNoExiste() throws Exception {
            MovimientoRequestDTO request = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("500.0000"))
                    .build();

            when(movimientoService.actualizar(eq(99L), any(MovimientoRequestDTO.class)))
                    .thenThrow(new MovementException("Movimiento no encontrado con ID: 99", HttpStatus.NOT_FOUND));

            mockMvc.perform(put("/movimientos/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /movimientos/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar un movimiento y retornar 204")
        void eliminarExitosamente() throws Exception {
            doNothing().when(movimientoService).eliminar(1L);

            mockMvc.perform(delete("/movimientos/1"))
                    .andExpect(status().isNoContent());

            verify(movimientoService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar 404 cuando movimiento a eliminar no existe")
        void eliminarNoExiste() throws Exception {
            doThrow(new MovementException("Movimiento no encontrado con ID: 99", HttpStatus.NOT_FOUND))
                    .when(movimientoService).eliminar(99L);

            mockMvc.perform(delete("/movimientos/99"))
                    .andExpect(status().isNotFound());
        }
    }
}
