package com.onboarding.cigmsasponboardingupgrademovement.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.onboarding.cigmsasponboardingupgrademovement.client.CuentaClient;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.CuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.EstadoCuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.entity.Movimiento;
import com.onboarding.cigmsasponboardingupgrademovement.domain.enums.TipoMovimiento;
import com.onboarding.cigmsasponboardingupgrademovement.exception.MovementException;
import com.onboarding.cigmsasponboardingupgrademovement.repository.MovimientoRepository;
import com.onboarding.cigmsasponboardingupgrademovement.service.MovimientoService;
import com.onboarding.cigmsasponboardingupgrademovement.service.mapper.MovimientoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovimientoServiceImpl implements MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final MovimientoMapper movimientoMapper;
    private final CuentaClient cuentaClient;

    @Override
    public MovimientoResponseDTO crear(MovimientoRequestDTO request) {
        CuentaDTO cuenta = cuentaClient.getCuentaById(request.getCuentaId());

        Movimiento movimiento = movimientoMapper.toEntity(request);

        BigDecimal ultimoSaldo = obtenerUltimoSaldo(request.getCuentaId(), cuenta.getSaldoInicial());
        BigDecimal nuevoSaldo = calcularSaldo(ultimoSaldo, request.getValor(), request.getTipoMovimiento());

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) < 0) {
            throw new MovementException("Saldo no disponible", HttpStatus.BAD_REQUEST, "valor");
        }

        movimiento.setSaldo(nuevoSaldo);
        Movimiento guardado = movimientoRepository.save(movimiento);
        return movimientoMapper.toResponseDTO(guardado, cuenta);
    }

    @Override
    public MovimientoResponseDTO obtenerPorId(Long id) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new MovementException(
                        "Movimiento no encontrado con ID: " + id, HttpStatus.NOT_FOUND));
        CuentaDTO cuenta = cuentaClient.getCuentaById(movimiento.getCuentaId());
        return movimientoMapper.toResponseDTO(movimiento, cuenta);
    }

    @Override
    public List<MovimientoResponseDTO> obtenerTodos() {
        return movimientoRepository.findAll().stream()
                .map(movimiento -> {
                    CuentaDTO cuenta = cuentaClient.getCuentaById(movimiento.getCuentaId());
                    return movimientoMapper.toResponseDTO(movimiento, cuenta);
                })
                .toList();
    }

    @Override
    public List<MovimientoResponseDTO> obtenerPorCuentaId(Long cuentaId) {
        CuentaDTO cuenta = cuentaClient.getCuentaById(cuentaId);
        return movimientoRepository.findByCuentaId(cuentaId).stream()
                .map(movimiento -> movimientoMapper.toResponseDTO(movimiento, cuenta))
                .toList();
    }

    @Override
    public MovimientoResponseDTO actualizar(Long id, MovimientoRequestDTO request) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new MovementException(
                        "Movimiento no encontrado con ID: " + id, HttpStatus.NOT_FOUND));

        CuentaDTO cuenta = cuentaClient.getCuentaById(request.getCuentaId());

        movimiento.setCuentaId(request.getCuentaId());
        movimiento.setFecha(request.getFecha().atStartOfDay());
        movimiento.setTipoMovimiento(request.getTipoMovimiento());
        movimiento.setValor(request.getValor());

        BigDecimal ultimoSaldo = obtenerUltimoSaldo(request.getCuentaId(), cuenta.getSaldoInicial());
        BigDecimal nuevoSaldo = calcularSaldo(ultimoSaldo, request.getValor(), request.getTipoMovimiento());

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) < 0) {
            throw new MovementException("Saldo no disponible", HttpStatus.BAD_REQUEST, "valor");
        }

        movimiento.setSaldo(nuevoSaldo);
        Movimiento actualizado = movimientoRepository.save(movimiento);
        return movimientoMapper.toResponseDTO(actualizado, cuenta);
    }

    @Override
    public void eliminar(Long id) {
        if (!movimientoRepository.existsById(id)) {
            throw new MovementException(
                    "Movimiento no encontrado con ID: " + id, HttpStatus.NOT_FOUND);
        }
        movimientoRepository.deleteById(id);
    }

    @Override
    public List<EstadoCuentaDTO> obtenerEstadosCuenta() {
        List<CuentaDTO> cuentas = cuentaClient.getAllCuentas();
        return cuentas.stream()
                .map(cuenta -> construirEstadoCuenta(cuenta))
                .toList();
    }

    @Override
    public EstadoCuentaDTO obtenerEstadoCuentaPorCuentaId(Long cuentaId) {
        CuentaDTO cuenta = cuentaClient.getCuentaById(cuentaId);
        return construirEstadoCuenta(cuenta);
    }

    private EstadoCuentaDTO construirEstadoCuenta(CuentaDTO cuenta) {
        List<Movimiento> movimientos = movimientoRepository.findByCuentaIdOrderByFechaAsc(cuenta.getCuentaId());

        BigDecimal totalCredito = movimientos.stream()
                .filter(m -> m.getTipoMovimiento() == TipoMovimiento.CREDITO)
                .map(Movimiento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDebito = movimientos.stream()
                .filter(m -> m.getTipoMovimiento() == TipoMovimiento.DEBITO)
                .map(Movimiento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo = cuenta.getSaldoInicial().add(totalCredito).subtract(totalDebito);

        LocalDate ultimoMovimiento = movimientos.isEmpty()
                ? null
                : movimientos.get(movimientos.size() - 1).getFecha().toLocalDate();

        return EstadoCuentaDTO.builder()
                .numeroCuenta(cuenta.getNumeroCuenta())
                .tipoCuenta(cuenta.getTipoCuenta())
                .nombreCliente(cuenta.getCliente() != null ? cuenta.getCliente().getNombre() : null)
                .saldoInicial(cuenta.getSaldoInicial())
                .credito(totalCredito)
                .debito(totalDebito)
                .saldo(saldo)
                .ultimoMovimiento(ultimoMovimiento)
                .build();
    }

    private BigDecimal obtenerUltimoSaldo(Long cuentaId, BigDecimal saldoInicial) {
        List<Movimiento> movimientos = movimientoRepository.findByCuentaId(cuentaId);
        if (movimientos.isEmpty()) {
            return saldoInicial;
        }
        return movimientos.stream()
                .max((m1, m2) -> m1.getFecha().compareTo(m2.getFecha()))
                .map(Movimiento::getSaldo)
                .orElse(saldoInicial);
    }

    private BigDecimal calcularSaldo(BigDecimal saldoActual, BigDecimal valor, TipoMovimiento tipo) {
        return tipo == TipoMovimiento.CREDITO
                ? saldoActual.add(valor)
                : saldoActual.subtract(valor);
    }
}
