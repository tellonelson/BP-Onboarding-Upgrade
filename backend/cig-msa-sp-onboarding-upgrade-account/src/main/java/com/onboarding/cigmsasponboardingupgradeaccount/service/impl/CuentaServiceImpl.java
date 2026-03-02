package com.onboarding.cigmsasponboardingupgradeaccount.service.impl;

import com.onboarding.cigmsasponboardingupgradeaccount.client.ClienteClient;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.Cuenta;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.ClienteResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaUpdateDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.exception.AcccountException;
import com.onboarding.cigmsasponboardingupgradeaccount.repository.CuentaRepository;
import com.onboarding.cigmsasponboardingupgradeaccount.service.CuentaService;
import com.onboarding.cigmsasponboardingupgradeaccount.service.mapper.CuentaMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository cuentaRepository;
    private final ClienteClient clienteClient;
    private final CuentaMapper cuentaMapper;
    private final ObjectMapper objectMapper;

    @Override
    public CuentaResponseDTO crear(CuentaRequestDTO request) {
        ClienteResponseDTO cliente = obtenerClienteOLanzar(request.getClienteId());
        Cuenta cuenta = cuentaMapper.toEntity(request);
        cuenta = cuentaRepository.save(cuenta);
        return cuentaMapper.toResponseDTO(cuenta, cliente);
    }

    @Override
    public List<CuentaResponseDTO> listarTodas() {
        return cuentaRepository.findAll().stream()
                .map(cuenta -> {
                    ClienteResponseDTO cliente = obtenerCliente(cuenta.getClienteId());
                    return cuentaMapper.toResponseDTO(cuenta, cliente);
                })
                .toList();
    }

    @Override
    public CuentaResponseDTO obtenerPorId(Long id) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new AcccountException("Cuenta no encontrada con id: " + id, HttpStatus.NOT_FOUND));
        ClienteResponseDTO cliente = obtenerCliente(cuenta.getClienteId());
        return cuentaMapper.toResponseDTO(cuenta, cliente);
    }

    @Override
    public CuentaResponseDTO actualizar(Long id, CuentaUpdateDTO request) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new AcccountException("Cuenta no encontrada con id: " + id, HttpStatus.NOT_FOUND));

        if (request.getClienteId() != null) {
            obtenerClienteOLanzar(request.getClienteId());
            cuenta.setClienteId(request.getClienteId());
        }

        if (request.getNumeroCuenta() != null) {
            if (cuentaRepository.existsByNumeroCuentaAndCuentaIdNot(request.getNumeroCuenta(), id)) {
                throw new AcccountException("El número de cuenta ya está en uso", HttpStatus.CONFLICT, "numeroCuenta");
            }
            cuenta.setNumeroCuenta(request.getNumeroCuenta());
        }

        if (request.getTipoCuenta() != null) {
            cuenta.setTipoCuenta(request.getTipoCuenta());
        }

        if (request.getSaldoInicial() != null) {
            cuenta.setSaldoInicial(request.getSaldoInicial());
        }

        if (request.getEstado() != null) {
            cuenta.setEstado(request.getEstado());
        }

        cuenta = cuentaRepository.save(cuenta);
        ClienteResponseDTO cliente = obtenerCliente(cuenta.getClienteId());
        return cuentaMapper.toResponseDTO(cuenta, cliente);
    }

    @Override
    public void eliminar(Long id) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new AcccountException("Cuenta no encontrada con id: " + id, HttpStatus.NOT_FOUND));
        cuentaRepository.delete(cuenta);
    }

    private ClienteResponseDTO obtenerClienteOLanzar(Long clienteId) {
        try {
            ClienteResponseDTO cliente = clienteClient.getClienteById(clienteId);
            if (cliente == null) {
                throw new AcccountException("Cliente no encontrado con id: " + clienteId, HttpStatus.NOT_FOUND);
            }
            if (Boolean.FALSE.equals(cliente.getEstado())) {
                throw new AcccountException(
                        "No se puede crear una cuenta para un cliente inactivo (id: " + clienteId + ")",
                        HttpStatus.BAD_REQUEST, "clienteId");
            }
            return cliente;
        } catch (FeignException e) {
            String mensaje = extraerMensajeFeign(e);
            HttpStatus status = HttpStatus.resolve(e.status());
            if (status == null) {
                status = HttpStatus.SERVICE_UNAVAILABLE;
            }
            throw new AcccountException(mensaje, status);
        } catch (AcccountException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al comunicarse con el servicio de clientes: {}", e.getMessage());
            throw new AcccountException("Servicio de clientes no disponible", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private String extraerMensajeFeign(FeignException e) {
        try {
            String body = e.contentUTF8();
            JsonNode json = objectMapper.readTree(body);
            if (json.has("message")) {
                return json.get("message").asText();
            }
        } catch (Exception ex) {
            log.warn("No se pudo parsear el error del servicio de clientes: {}", ex.getMessage());
        }
        return "Error en el servicio de clientes (HTTP " + e.status() + ")";
    }

    private ClienteResponseDTO obtenerCliente(Long clienteId) {
        try {
            return clienteClient.getClienteById(clienteId);
        } catch (Exception e) {
            log.warn("No se pudo obtener datos del cliente con id {}: {}", clienteId, e.getMessage());
            return null;
        }
    }
}
