package com.onboarding.cigmsasponboardingupgrademovement.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.EstadoCuentaDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoRequestDTO;
import com.onboarding.cigmsasponboardingupgrademovement.domain.dto.MovimientoResponseDTO;
import com.onboarding.cigmsasponboardingupgrademovement.service.MovimientoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;

    @PostMapping
    public ResponseEntity<MovimientoResponseDTO> crear(@Valid @RequestBody MovimientoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoService.crear(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MovimientoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(movimientoService.obtenerTodos());
    }

    @GetMapping("/cuenta/{cuentaId}")
    public ResponseEntity<List<MovimientoResponseDTO>> obtenerPorCuentaId(@PathVariable Long cuentaId) {
        return ResponseEntity.ok(movimientoService.obtenerPorCuentaId(cuentaId));
    }

    @GetMapping("/estado-cuenta")
    public ResponseEntity<List<EstadoCuentaDTO>> obtenerEstadosCuenta() {
        return ResponseEntity.ok(movimientoService.obtenerEstadosCuenta());
    }

    @GetMapping("/estado-cuenta/{cuentaId}")
    public ResponseEntity<EstadoCuentaDTO> obtenerEstadoCuenta(@PathVariable Long cuentaId) {
        return ResponseEntity.ok(movimientoService.obtenerEstadoCuentaPorCuentaId(cuentaId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimientoResponseDTO> actualizar(@PathVariable Long id,
            @Valid @RequestBody MovimientoRequestDTO request) {
        return ResponseEntity.ok(movimientoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        movimientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
