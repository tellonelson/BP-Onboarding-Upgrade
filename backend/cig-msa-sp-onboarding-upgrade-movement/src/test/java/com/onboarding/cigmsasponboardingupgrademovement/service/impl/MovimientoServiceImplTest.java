package com.onboarding.cigmsasponboardingupgrademovement.service.impl;

import com.onboarding.cigmsasponboardingupgrademovement.client.CuentaClient;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.ClienteDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.CuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.EstadoCuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.entity.Movimiento;
import com.onboarding.cigmsasponboardingupgrademovement.domain.enums.TipoMovimiento;
import com.onboarding.cigmsasponboardingupgrademovement.exception.MovementException;
import com.onboarding.cigmsasponboardingupgrademovement.repository.MovimientoRepository;
import com.onboarding.cigmsasponboardingupgrademovement.service.mapper.MovimientoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovimientoServiceImplTest {

    @Mock
    private MovimientoRepository movimientoRepository;

    @Mock
    private MovimientoMapper movimientoMapper;

    @Mock
    private CuentaClient cuentaClient;

    @InjectMocks
    private MovimientoServiceImpl movimientoService;

    private CuentaDTO cuentaDTO;
    private ClienteDTO clienteDTO;
    private Movimiento movimiento;
    private MovimientoRequestDTO requestDTO;
    private MovimientoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        clienteDTO = new ClienteDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", true);
        cuentaDTO = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), true, clienteDTO);

        movimiento = Movimiento.builder()
                .movimientoId(1L)
                .cuentaId(1L)
                .fecha(LocalDate.of(2026, 3, 1).atStartOfDay())
                .tipoMovimiento(TipoMovimiento.CREDITO)
                .valor(new BigDecimal("500.0000"))
                .saldo(new BigDecimal("1500.0000"))
                .build();

        requestDTO = MovimientoRequestDTO.builder()
                .cuentaId(1L)
                .fecha(LocalDate.of(2026, 3, 1))
                .tipoMovimiento(TipoMovimiento.CREDITO)
                .valor(new BigDecimal("500.0000"))
                .build();

        responseDTO = MovimientoResponseDTO.builder()
                .movimientoId(1L)
                .fecha(LocalDate.of(2026, 3, 1).atStartOfDay())
                .tipoMovimiento(TipoMovimiento.CREDITO)
                .valor(new BigDecimal("500.0000"))
                .saldo(new BigDecimal("1500.0000"))
                .cuenta(cuentaDTO)
                .build();
    }

    @Nested
    @DisplayName("crear()")
    class CrearTests {

        @Test
        @DisplayName("Debe crear un movimiento de credito exitosamente")
        void crearMovimientoCreditoExitosamente() {
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toEntity(requestDTO)).thenReturn(movimiento);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());
            when(movimientoRepository.save(any(Movimiento.class))).thenReturn(movimiento);
            when(movimientoMapper.toResponseDTO(movimiento, cuentaDTO)).thenReturn(responseDTO);

            MovimientoResponseDTO result = movimientoService.crear(requestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getMovimientoId()).isEqualTo(1L);
            assertThat(result.getSaldo()).isEqualTo(new BigDecimal("1500.0000"));
            verify(movimientoRepository).save(any(Movimiento.class));
        }

        @Test
        @DisplayName("Debe crear un movimiento de debito exitosamente")
        void crearMovimientoDebitoExitosamente() {
            MovimientoRequestDTO debitoRequest = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("200.0000"))
                    .build();

            Movimiento debitoMovimiento = Movimiento.builder()
                    .movimientoId(2L)
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1).atStartOfDay())
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("200.0000"))
                    .saldo(new BigDecimal("800.0000"))
                    .build();

            MovimientoResponseDTO debitoResponse = MovimientoResponseDTO.builder()
                    .movimientoId(2L)
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("200.0000"))
                    .saldo(new BigDecimal("800.0000"))
                    .cuenta(cuentaDTO)
                    .build();

            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toEntity(debitoRequest)).thenReturn(debitoMovimiento);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());
            when(movimientoRepository.save(any(Movimiento.class))).thenReturn(debitoMovimiento);
            when(movimientoMapper.toResponseDTO(debitoMovimiento, cuentaDTO)).thenReturn(debitoResponse);

            MovimientoResponseDTO result = movimientoService.crear(debitoRequest);

            assertThat(result).isNotNull();
            assertThat(result.getTipoMovimiento()).isEqualTo(TipoMovimiento.DEBITO);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando saldo no es suficiente para debito")
        void crearMovimientoSaldoInsuficiente() {
            MovimientoRequestDTO debitoRequest = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("2000.0000"))
                    .build();

            Movimiento debitoMovimiento = Movimiento.builder()
                    .cuentaId(1L)
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("2000.0000"))
                    .build();

            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toEntity(debitoRequest)).thenReturn(debitoMovimiento);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> movimientoService.crear(debitoRequest))
                    .isInstanceOf(MovementException.class)
                    .hasMessage("Saldo no disponible");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando la cuenta esta inactiva")
        void crearMovimientoCuentaInactiva() {
            CuentaDTO cuentaInactiva = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), false, clienteDTO);
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaInactiva);

            assertThatThrownBy(() -> movimientoService.crear(requestDTO))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("cuenta inactiva");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando el cliente esta inactivo")
        void crearMovimientoClienteInactivo() {
            ClienteDTO clienteInactivo = new ClienteDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", false);
            CuentaDTO cuentaConClienteInactivo = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), true, clienteInactivo);
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaConClienteInactivo);

            assertThatThrownBy(() -> movimientoService.crear(requestDTO))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("cliente inactivo");
        }

        @Test
        @DisplayName("Debe calcular saldo basado en ultimo movimiento existente")
        void crearMovimientoConMovimientosPrevios() {
            Movimiento previo = Movimiento.builder()
                    .movimientoId(1L)
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 2, 28).atStartOfDay())
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("500.0000"))
                    .saldo(new BigDecimal("1500.0000"))
                    .build();

            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toEntity(requestDTO)).thenReturn(movimiento);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(List.of(previo));
            when(movimientoRepository.save(any(Movimiento.class))).thenReturn(movimiento);
            when(movimientoMapper.toResponseDTO(any(Movimiento.class), eq(cuentaDTO))).thenReturn(responseDTO);

            MovimientoResponseDTO result = movimientoService.crear(requestDTO);

            assertThat(result).isNotNull();
            verify(movimientoRepository).save(any(Movimiento.class));
        }
    }

    @Nested
    @DisplayName("obtenerPorId()")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe obtener movimiento por id exitosamente")
        void obtenerPorIdExitosamente() {
            when(movimientoRepository.findById(1L)).thenReturn(Optional.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toResponseDTO(movimiento, cuentaDTO)).thenReturn(responseDTO);

            MovimientoResponseDTO result = movimientoService.obtenerPorId(1L);

            assertThat(result).isNotNull();
            assertThat(result.getMovimientoId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando movimiento no existe")
        void obtenerPorIdNoExiste() {
            when(movimientoRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> movimientoService.obtenerPorId(99L))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("Movimiento no encontrado con ID: 99");
        }
    }

    @Nested
    @DisplayName("obtenerTodos()")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe obtener todos los movimientos")
        void obtenerTodosExitosamente() {
            when(movimientoRepository.findAll()).thenReturn(List.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoMapper.toResponseDTO(movimiento, cuentaDTO)).thenReturn(responseDTO);

            List<MovimientoResponseDTO> result = movimientoService.obtenerTodos();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getMovimientoId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Debe retornar lista vacia cuando no hay movimientos")
        void obtenerTodosVacia() {
            when(movimientoRepository.findAll()).thenReturn(Collections.emptyList());

            List<MovimientoResponseDTO> result = movimientoService.obtenerTodos();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("obtenerPorCuentaId()")
    class ObtenerPorCuentaIdTests {

        @Test
        @DisplayName("Debe obtener movimientos por cuenta id")
        void obtenerPorCuentaIdExitosamente() {
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(List.of(movimiento));
            when(movimientoMapper.toResponseDTO(movimiento, cuentaDTO)).thenReturn(responseDTO);

            List<MovimientoResponseDTO> result = movimientoService.obtenerPorCuentaId(1L);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Debe retornar lista vacia cuando la cuenta no tiene movimientos")
        void obtenerPorCuentaIdSinMovimientos() {
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());

            List<MovimientoResponseDTO> result = movimientoService.obtenerPorCuentaId(1L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("actualizar()")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar un movimiento exitosamente")
        void actualizarExitosamente() {
            when(movimientoRepository.findById(1L)).thenReturn(Optional.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());
            when(movimientoRepository.save(any(Movimiento.class))).thenReturn(movimiento);
            when(movimientoMapper.toResponseDTO(any(Movimiento.class), eq(cuentaDTO))).thenReturn(responseDTO);

            MovimientoResponseDTO result = movimientoService.actualizar(1L, requestDTO);

            assertThat(result).isNotNull();
            verify(movimientoRepository).save(any(Movimiento.class));
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando movimiento a actualizar no existe")
        void actualizarNoExiste() {
            when(movimientoRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> movimientoService.actualizar(99L, requestDTO))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("Movimiento no encontrado con ID: 99");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando la cuenta esta inactiva al actualizar")
        void actualizarCuentaInactiva() {
            CuentaDTO cuentaInactiva = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), false, clienteDTO);
            when(movimientoRepository.findById(1L)).thenReturn(Optional.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaInactiva);

            assertThatThrownBy(() -> movimientoService.actualizar(1L, requestDTO))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("cuenta inactiva");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando el cliente esta inactivo al actualizar")
        void actualizarClienteInactivo() {
            ClienteDTO clienteInactivo = new ClienteDTO(1L, "Juan Perez", "1234567890", 30, "MASCULINO", "0991234567", "Quito", "pass123", false);
            CuentaDTO cuentaConClienteInactivo = new CuentaDTO(1L, "1234567890", "AHORROS", new BigDecimal("1000.0000"), true, clienteInactivo);
            when(movimientoRepository.findById(1L)).thenReturn(Optional.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaConClienteInactivo);

            assertThatThrownBy(() -> movimientoService.actualizar(1L, requestDTO))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("cliente inactivo");
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando saldo insuficiente al actualizar")
        void actualizarSaldoInsuficiente() {
            MovimientoRequestDTO debitoRequest = MovimientoRequestDTO.builder()
                    .cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1))
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("5000.0000"))
                    .build();

            when(movimientoRepository.findById(1L)).thenReturn(Optional.of(movimiento));
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoRepository.findByCuentaId(1L)).thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> movimientoService.actualizar(1L, debitoRequest))
                    .isInstanceOf(MovementException.class)
                    .hasMessage("Saldo no disponible");
        }
    }

    @Nested
    @DisplayName("eliminar()")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar un movimiento exitosamente")
        void eliminarExitosamente() {
            when(movimientoRepository.existsById(1L)).thenReturn(true);

            movimientoService.eliminar(1L);

            verify(movimientoRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Debe lanzar excepcion cuando movimiento a eliminar no existe")
        void eliminarNoExiste() {
            when(movimientoRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> movimientoService.eliminar(99L))
                    .isInstanceOf(MovementException.class)
                    .hasMessageContaining("Movimiento no encontrado con ID: 99");
        }
    }

    @Nested
    @DisplayName("obtenerEstadosCuenta()")
    class EstadosCuentaTests {

        @Test
        @DisplayName("Debe obtener estados de cuenta de todas las cuentas")
        void obtenerEstadosCuentaExitosamente() {
            when(cuentaClient.getAllCuentas()).thenReturn(List.of(cuentaDTO));
            when(movimientoRepository.findByCuentaIdOrderByFechaAsc(1L)).thenReturn(List.of(movimiento));

            List<EstadoCuentaDTO> result = movimientoService.obtenerEstadosCuenta();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getNumeroCuenta()).isEqualTo("1234567890");
            assertThat(result.get(0).getNombreCliente()).isEqualTo("Juan Perez");
            assertThat(result.get(0).getCredito()).isEqualTo(new BigDecimal("500.0000"));
            assertThat(result.get(0).getDebito()).isEqualTo(BigDecimal.ZERO);
            assertThat(result.get(0).getSaldo()).isEqualTo(new BigDecimal("1500.0000"));
            assertThat(result.get(0).getUltimoMovimiento()).isEqualTo(LocalDate.of(2026, 3, 1));
        }

        @Test
        @DisplayName("Debe retornar lista vacia cuando no hay cuentas")
        void obtenerEstadosCuentaSinCuentas() {
            when(cuentaClient.getAllCuentas()).thenReturn(Collections.emptyList());

            List<EstadoCuentaDTO> result = movimientoService.obtenerEstadosCuenta();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Debe calcular estado de cuenta con creditos y debitos")
        void obtenerEstadosCuentaConCreditosYDebitos() {
            Movimiento credito = Movimiento.builder()
                    .movimientoId(1L).cuentaId(1L)
                    .fecha(LocalDate.of(2026, 2, 1).atStartOfDay())
                    .tipoMovimiento(TipoMovimiento.CREDITO)
                    .valor(new BigDecimal("300.0000")).saldo(new BigDecimal("1300.0000"))
                    .build();
            Movimiento debito = Movimiento.builder()
                    .movimientoId(2L).cuentaId(1L)
                    .fecha(LocalDate.of(2026, 3, 1).atStartOfDay())
                    .tipoMovimiento(TipoMovimiento.DEBITO)
                    .valor(new BigDecimal("100.0000")).saldo(new BigDecimal("1200.0000"))
                    .build();

            when(cuentaClient.getAllCuentas()).thenReturn(List.of(cuentaDTO));
            when(movimientoRepository.findByCuentaIdOrderByFechaAsc(1L)).thenReturn(List.of(credito, debito));

            List<EstadoCuentaDTO> result = movimientoService.obtenerEstadosCuenta();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCredito()).isEqualTo(new BigDecimal("300.0000"));
            assertThat(result.get(0).getDebito()).isEqualTo(new BigDecimal("100.0000"));
            assertThat(result.get(0).getSaldo()).isEqualTo(new BigDecimal("1200.0000"));
            assertThat(result.get(0).getUltimoMovimiento()).isEqualTo(LocalDate.of(2026, 3, 1));
        }

        @Test
        @DisplayName("Debe manejar cuenta sin movimientos en estado de cuenta")
        void obtenerEstadoCuentaSinMovimientos() {
            when(cuentaClient.getAllCuentas()).thenReturn(List.of(cuentaDTO));
            when(movimientoRepository.findByCuentaIdOrderByFechaAsc(1L)).thenReturn(Collections.emptyList());

            List<EstadoCuentaDTO> result = movimientoService.obtenerEstadosCuenta();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCredito()).isEqualTo(BigDecimal.ZERO);
            assertThat(result.get(0).getDebito()).isEqualTo(BigDecimal.ZERO);
            assertThat(result.get(0).getSaldo()).isEqualTo(new BigDecimal("1000.0000"));
            assertThat(result.get(0).getUltimoMovimiento()).isNull();
        }

        @Test
        @DisplayName("Debe manejar cuenta sin cliente en estado de cuenta")
        void obtenerEstadoCuentaSinCliente() {
            CuentaDTO cuentaSinCliente = new CuentaDTO(2L, "9999999999", "CORRIENTE", new BigDecimal("500.0000"), true, null);

            when(cuentaClient.getAllCuentas()).thenReturn(List.of(cuentaSinCliente));
            when(movimientoRepository.findByCuentaIdOrderByFechaAsc(2L)).thenReturn(Collections.emptyList());

            List<EstadoCuentaDTO> result = movimientoService.obtenerEstadosCuenta();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getNombreCliente()).isNull();
        }
    }

    @Nested
    @DisplayName("obtenerEstadoCuentaPorCuentaId()")
    class EstadoCuentaPorCuentaIdTests {

        @Test
        @DisplayName("Debe obtener estado de cuenta por id de cuenta")
        void obtenerEstadoCuentaPorCuentaIdExitosamente() {
            when(cuentaClient.getCuentaById(1L)).thenReturn(cuentaDTO);
            when(movimientoRepository.findByCuentaIdOrderByFechaAsc(1L)).thenReturn(List.of(movimiento));

            EstadoCuentaDTO result = movimientoService.obtenerEstadoCuentaPorCuentaId(1L);

            assertThat(result).isNotNull();
            assertThat(result.getNumeroCuenta()).isEqualTo("1234567890");
            assertThat(result.getSaldo()).isEqualTo(new BigDecimal("1500.0000"));
        }
    }
}
