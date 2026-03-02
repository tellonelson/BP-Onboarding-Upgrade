package com.onboarding.cigmsasponboardingupgradeaccount.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onboarding.cigmsasponboardingupgradeaccount.client.ClienteClient;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.Cuenta;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaUpdateDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.enums.TypeEnum;
import com.onboarding.cigmsasponboardingupgradeaccount.exception.AcccountException;
import com.onboarding.cigmsasponboardingupgradeaccount.repository.CuentaRepository;
import com.onboarding.cigmsasponboardingupgradeaccount.service.mapper.CuentaMapper;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CuentaServiceImplTest {

    @Mock
    private CuentaRepository cuentaRepository;

    @Mock
    private ClienteClient clienteClient;

    @Mock
    private CuentaMapper cuentaMapper;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CuentaServiceImpl cuentaService;

    private Cuenta cuenta;
    private CuentaRequestDTO requestDTO;
    private CuentaUpdateDTO updateDTO;
    private CuentaResponseDTO responseDTO;
    private ClienteResponseDTO clienteDTO;

    @BeforeEach
    void setUp() {
        clienteDTO = new ClienteResponseDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", true);

        cuenta = new Cuenta(1L, 1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"), true);

        requestDTO = new CuentaRequestDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"), true);

        updateDTO = new CuentaUpdateDTO();

        responseDTO = new CuentaResponseDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"), true, clienteDTO);
    }

    @Nested
    @DisplayName("crear()")
    class CrearTests {

        @Test
        @DisplayName("Debe crear una cuenta exitosamente")
        void crearCuentaExitosamente() {
            when(clienteClient.getClienteById(1L)).thenReturn(clienteDTO);
            when(cuentaMapper.toEntity(requestDTO)).thenReturn(cuenta);
            when(cuentaRepository.save(cuenta)).thenReturn(cuenta);
            when(cuentaMapper.toResponseDTO(cuenta, clienteDTO)).thenReturn(responseDTO);

            CuentaResponseDTO result = cuentaService.crear(requestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getCuentaId()).isEqualTo(1L);
            assertThat(result.getNumeroCuenta()).isEqualTo("1234567890");
            verify(clienteClient).getClienteById(1L);
            verify(cuentaRepository).save(cuenta);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando el cliente no existe")
        void crearCuentaClienteNoExiste() {
            when(clienteClient.getClienteById(1L)).thenReturn(null);

            assertThatThrownBy(() -> cuentaService.crear(requestDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Cliente no encontrado");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando FeignException ocurre con mensaje JSON")
        void crearCuentaFeignExceptionConMensajeJson() throws Exception {
            Request request = Request.create(Request.HttpMethod.GET, "/clientes/1",
                    Collections.emptyMap(), null, new RequestTemplate());
            String body = "{\"message\":\"Cliente no encontrado\"}";
            FeignException feignException = new FeignException.NotFound("Not Found", request,
                    body.getBytes(StandardCharsets.UTF_8), Collections.emptyMap());

            JsonNode jsonNode = mock(JsonNode.class);
            JsonNode messageNode = mock(JsonNode.class);
            when(clienteClient.getClienteById(1L)).thenThrow(feignException);
            when(objectMapper.readTree(anyString())).thenReturn(jsonNode);
            when(jsonNode.has("message")).thenReturn(true);
            when(jsonNode.get("message")).thenReturn(messageNode);
            when(messageNode.asText()).thenReturn("Cliente no encontrado");

            assertThatThrownBy(() -> cuentaService.crear(requestDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessage("Cliente no encontrado");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando FeignException ocurre sin campo message en JSON")
        void crearCuentaFeignExceptionSinCampoMessage() throws Exception {
            Request request = Request.create(Request.HttpMethod.GET, "/clientes/1",
                    Collections.emptyMap(), null, new RequestTemplate());
            String body = "{\"error\":\"not found\"}";
            FeignException feignException = new FeignException.NotFound("Not Found", request,
                    body.getBytes(StandardCharsets.UTF_8), Collections.emptyMap());

            JsonNode jsonNode = mock(JsonNode.class);
            when(clienteClient.getClienteById(1L)).thenThrow(feignException);
            when(objectMapper.readTree(anyString())).thenReturn(jsonNode);
            when(jsonNode.has("message")).thenReturn(false);

            assertThatThrownBy(() -> cuentaService.crear(requestDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Error en el servicio de clientes");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando FeignException tiene body no parseable")
        void crearCuentaFeignExceptionBodyNoParseable() throws Exception {
            Request request = Request.create(Request.HttpMethod.GET, "/clientes/1",
                    Collections.emptyMap(), null, new RequestTemplate());
            FeignException feignException = new FeignException.InternalServerError("Internal Server Error", request,
                    "not json".getBytes(StandardCharsets.UTF_8), Collections.emptyMap());

            when(clienteClient.getClienteById(1L)).thenThrow(feignException);
            when(objectMapper.readTree(anyString())).thenThrow(new RuntimeException("parse error"));

            assertThatThrownBy(() -> cuentaService.crear(requestDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Error en el servicio de clientes (HTTP 500)");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando ocurre error generico al comunicarse con clientes")
        void crearCuentaErrorGenerico() {
            when(clienteClient.getClienteById(1L)).thenThrow(new RuntimeException("Connection refused"));

            assertThatThrownBy(() -> cuentaService.crear(requestDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessage("Servicio de clientes no disponible");
        }
    }

    @Nested
    @DisplayName("listarTodas()")
    class ListarTodasTests {

        @Test
        @DisplayName("Debe listar todas las cuentas")
        void listarTodasExitosamente() {
            when(cuentaRepository.findAll()).thenReturn(List.of(cuenta));
            when(clienteClient.getClienteById(1L)).thenReturn(clienteDTO);
            when(cuentaMapper.toResponseDTO(cuenta, clienteDTO)).thenReturn(responseDTO);

            List<CuentaResponseDTO> result = cuentaService.listarTodas();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getNumeroCuenta()).isEqualTo("1234567890");
        }

        @Test
        @DisplayName("Debe retornar lista vacia cuando no hay cuentas")
        void listarTodasVacia() {
            when(cuentaRepository.findAll()).thenReturn(Collections.emptyList());

            List<CuentaResponseDTO> result = cuentaService.listarTodas();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Debe retornar cuenta con cliente null cuando el servicio de clientes falla")
        void listarTodasClienteFalla() {
            CuentaResponseDTO responseSinCliente = new CuentaResponseDTO(1L, "1234567890", TypeEnum.AHORROS, new BigDecimal("1000.0000"), true, null);
            when(cuentaRepository.findAll()).thenReturn(List.of(cuenta));
            when(clienteClient.getClienteById(1L)).thenThrow(new RuntimeException("Service unavailable"));
            when(cuentaMapper.toResponseDTO(cuenta, null)).thenReturn(responseSinCliente);

            List<CuentaResponseDTO> result = cuentaService.listarTodas();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCliente()).isNull();
        }
    }

    @Nested
    @DisplayName("obtenerPorId()")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe obtener cuenta por id exitosamente")
        void obtenerPorIdExitosamente() {
            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
            when(clienteClient.getClienteById(1L)).thenReturn(clienteDTO);
            when(cuentaMapper.toResponseDTO(cuenta, clienteDTO)).thenReturn(responseDTO);

            CuentaResponseDTO result = cuentaService.obtenerPorId(1L);

            assertThat(result).isNotNull();
            assertThat(result.getCuentaId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando la cuenta no existe")
        void obtenerPorIdNoExiste() {
            when(cuentaRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cuentaService.obtenerPorId(99L))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Cuenta no encontrada con id: 99");
        }
    }

    @Nested
    @DisplayName("actualizar()")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar todos los campos de la cuenta")
        void actualizarTodosCampos() {
            updateDTO = new CuentaUpdateDTO(2L, "9999999999", TypeEnum.CORRIENTE, new BigDecimal("5000.0000"), true);
            ClienteResponseDTO nuevoCliente = new ClienteResponseDTO(2L, "Maria Lopez", "0987654321", 25, "FEMENINO", "0997654321", "Guayaquil", "pass456", true);
            CuentaResponseDTO updatedResponse = new CuentaResponseDTO(1L, "9999999999", TypeEnum.CORRIENTE, new BigDecimal("5000.0000"), true, nuevoCliente);

            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
            when(clienteClient.getClienteById(anyLong())).thenReturn(nuevoCliente);
            when(cuentaRepository.existsByNumeroCuentaAndCuentaIdNot("9999999999", 1L)).thenReturn(false);
            when(cuentaRepository.save(any(Cuenta.class))).thenReturn(cuenta);
            when(cuentaMapper.toResponseDTO(any(Cuenta.class), eq(nuevoCliente))).thenReturn(updatedResponse);

            CuentaResponseDTO result = cuentaService.actualizar(1L, updateDTO);

            assertThat(result).isNotNull();
            assertThat(result.getNumeroCuenta()).isEqualTo("9999999999");
            assertThat(result.getTipoCuenta()).isEqualTo(TypeEnum.CORRIENTE);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando la cuenta no existe al actualizar")
        void actualizarCuentaNoExiste() {
            when(cuentaRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cuentaService.actualizar(99L, updateDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Cuenta no encontrada con id: 99");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando el numero de cuenta ya esta en uso")
        void actualizarNumeroCuentaDuplicado() {
            updateDTO = new CuentaUpdateDTO(null, "DUPLICADO", null, null, null);

            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
            when(cuentaRepository.existsByNumeroCuentaAndCuentaIdNot("DUPLICADO", 1L)).thenReturn(true);

            assertThatThrownBy(() -> cuentaService.actualizar(1L, updateDTO))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("El número de cuenta ya está en uso");
        }

        @Test
        @DisplayName("Debe actualizar solo campos no nulos")
        void actualizarSoloCamposNoNulos() {
            updateDTO = new CuentaUpdateDTO(null, null, null, new BigDecimal("2000.0000"), null);

            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
            when(cuentaRepository.save(any(Cuenta.class))).thenReturn(cuenta);
            when(clienteClient.getClienteById(1L)).thenReturn(clienteDTO);
            when(cuentaMapper.toResponseDTO(any(Cuenta.class), eq(clienteDTO))).thenReturn(responseDTO);

            CuentaResponseDTO result = cuentaService.actualizar(1L, updateDTO);

            assertThat(result).isNotNull();
            verify(cuentaRepository).save(any(Cuenta.class));
        }

        @Test
        @DisplayName("Debe actualizar solo tipoCuenta cuando es el unico campo no nulo")
        void actualizarSoloTipoCuenta() {
            updateDTO = new CuentaUpdateDTO(null, null, TypeEnum.CORRIENTE, null, null);

            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
            when(cuentaRepository.save(any(Cuenta.class))).thenReturn(cuenta);
            when(clienteClient.getClienteById(1L)).thenReturn(clienteDTO);
            when(cuentaMapper.toResponseDTO(any(Cuenta.class), eq(clienteDTO))).thenReturn(responseDTO);

            cuentaService.actualizar(1L, updateDTO);

            assertThat(cuenta.getTipoCuenta()).isEqualTo(TypeEnum.CORRIENTE);
        }
    }

    @Nested
    @DisplayName("eliminar()")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar una cuenta exitosamente")
        void eliminarExitosamente() {
            when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));

            cuentaService.eliminar(1L);

            verify(cuentaRepository).delete(cuenta);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando la cuenta a eliminar no existe")
        void eliminarNoExiste() {
            when(cuentaRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cuentaService.eliminar(99L))
                    .isInstanceOf(AcccountException.class)
                    .hasMessageContaining("Cuenta no encontrada con id: 99");
        }
    }
}
