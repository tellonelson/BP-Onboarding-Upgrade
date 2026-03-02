package com.onboarding.cigmsasponboardingupgradeaccount.domain;

import com.onboarding.cigmsasponboardingupgradeaccount.domain.enums.TypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "cuenta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cuenta_id")
    private Long cuentaId;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "numero_cuenta", length = 100, unique = true, nullable = false)
    private String numeroCuenta;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", nullable = false)
    private TypeEnum tipoCuenta;

    @Column(name = "saldo_inicial", precision = 14, scale = 4, nullable = false)
    private BigDecimal saldoInicial;

    @Column(name = "estado", nullable = false, columnDefinition = "boolean default true")
    private Boolean estado = true;
}
