package com.onboarding.cigmsasponboardingupgradeaccount.controller;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaRequestDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaResponseDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.domain.dto.CuentaUpdateDTO;
import com.onboarding.cigmsasponboardingupgradeaccount.service.CuentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/cuentas", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class CuentaController {

    private final CuentaService cuentaService;

    @PostMapping
    public ResponseEntity<CuentaResponseDTO> crear(@Valid @RequestBody CuentaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuentaService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<CuentaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(cuentaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuentaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cuentaService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CuentaResponseDTO> actualizar(@PathVariable Long id,
                                                         @Valid @RequestBody CuentaUpdateDTO request) {
        return ResponseEntity.ok(cuentaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cuentaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
