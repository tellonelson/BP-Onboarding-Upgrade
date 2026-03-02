import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovimientosService } from '../movimientos.service';
import { CuentasService } from '../../cuentas/cuentas.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TipoMovimientoEnum } from '../../../core/models/movimiento.model';
import { Cuenta } from '../../../core/models/cuenta.model';

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="max-w-3xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode() ? 'Editar Movimiento' : 'Nuevo Movimiento' }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ isEditMode() ? 'Actualiza la información del movimiento' : 'Completa el formulario para crear un nuevo movimiento' }}
        </p>
      </div>

      <!-- Loading Cuentas -->
      @if (loadingCuentas()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Form -->
      @if (!loadingCuentas()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Cuenta -->
            <div class="md:col-span-2">
              <label for="cuentaId" class="block text-sm font-medium text-gray-700 mb-1">
                Cuenta <span class="text-red-500">*</span>
              </label>
              <select
                id="cuentaId"
                formControlName="cuentaId"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('cuentaId')?.invalid && form.get('cuentaId')?.touched"
              >
                <option [value]="null">Seleccione una cuenta</option>
                @for (cuenta of cuentas(); track cuenta.cuentaId) {
                  <option [value]="cuenta.cuentaId">
                    {{ cuenta.numeroCuenta }} - {{ getCuentaClienteName(cuenta) }}
                  </option>
                }
              </select>
              @if (form.get('cuentaId')?.invalid && form.get('cuentaId')?.touched) {
                <p class="mt-1 text-sm text-red-600">La cuenta es requerida</p>
              }
            </div>

            <!-- Fecha -->
            <div>
              <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                id="fecha"
                type="date"
                formControlName="fecha"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('fecha')?.invalid && form.get('fecha')?.touched"
              />
              @if (form.get('fecha')?.invalid && form.get('fecha')?.touched) {
                <p class="mt-1 text-sm text-red-600">La fecha es requerida</p>
              }
            </div>

            <!-- Tipo de Movimiento -->
            <div>
              <label for="tipoMovimiento" class="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento <span class="text-red-500">*</span>
              </label>
              <select
                id="tipoMovimiento"
                formControlName="tipoMovimiento"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('tipoMovimiento')?.invalid && form.get('tipoMovimiento')?.touched"
              >
                <option value="">Seleccione un tipo</option>
                <option [value]="TipoMovimientoEnum.CREDITO">Crédito</option>
                <option [value]="TipoMovimientoEnum.DEBITO">Débito</option>
              </select>
              @if (form.get('tipoMovimiento')?.invalid && form.get('tipoMovimiento')?.touched) {
                <p class="mt-1 text-sm text-red-600">El tipo de movimiento es requerido</p>
              }
            </div>

            <!-- Valor -->
            <div>
              <label for="valor" class="block text-sm font-medium text-gray-700 mb-1">
                Valor <span class="text-red-500">*</span>
              </label>
              <input
                id="valor"
                type="number"
                formControlName="valor"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('valor')?.invalid && form.get('valor')?.touched"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              @if (form.get('valor')?.invalid && form.get('valor')?.touched) {
                <p class="mt-1 text-sm text-red-600">
                  @if (form.get('valor')?.errors?.['required']) {
                    El valor es requerido
                  }
                  @if (form.get('valor')?.errors?.['min']) {
                    El valor debe ser mayor a 0
                  }
                </p>
              }
            </div>

          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <app-button
              [type]="'submit'"
              [variant]="'primary'"
              [disabled]="form.invalid || saving()"
              [loading]="saving()"
              [fullWidth]="false"
            >
              {{ isEditMode() ? 'Actualizar' : 'Crear' }} Movimiento
            </app-button>
            <app-button
              [type]="'button'"
              [variant]="'secondary'"
              [disabled]="saving()"
              (clicked)="onCancel()"
            >
              Cancelar
            </app-button>
          </div>
        </form>
      }
    </div>
  `
})
export class MovimientoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movimientosService = inject(MovimientosService);
  private cuentasService = inject(CuentasService);
  private notificationService = inject(NotificationService);

  // Expose enum to template
  TipoMovimientoEnum = TipoMovimientoEnum;

  form!: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  loadingCuentas = signal(false);
  movimientoId = signal<number | null>(null);
  cuentas = signal<Cuenta[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadCuentas();
    this.checkEditMode();
  }

  private initForm(): void {
    // Fecha por defecto: hoy
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      cuentaId: [null, [Validators.required]],
      fecha: [today, [Validators.required]],
      tipoMovimiento: ['', [Validators.required]],
      valor: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private loadCuentas(): void {
    this.loadingCuentas.set(true);
    this.cuentasService.getAll({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.cuentas.set(response.content);
        this.loadingCuentas.set(false);
      },
      error: (error) => {
        this.notificationService.error('Error al cargar las cuentas');
        this.loadingCuentas.set(false);
        console.error('Error loading cuentas:', error);
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.movimientoId.set(parseInt(id, 10));
      this.loadMovimiento(parseInt(id, 10));
    }
  }

  private loadMovimiento(id: number): void {
    this.movimientosService.getById(id).subscribe({
      next: (movimiento) => {
        this.form.patchValue({
          cuentaId: movimiento.cuenta?.cuentaId || null,
          fecha: movimiento.fecha,
          tipoMovimiento: movimiento.tipoMovimiento,
          valor: movimiento.valor
        });
      },
      error: (error) => {
        this.notificationService.error('Movimiento no encontrado');
        this.router.navigate(['/movimientos']);
        console.error('Error loading movimiento:', error);
      }
    });
  }

  getCuentaClienteName(cuenta: Cuenta): string {
    return cuenta.cliente?.nombre || 'Sin cliente';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    console.log('📋 Valor del formulario completo:', formValue);
    console.log('🏦 cuentaId RAW:', formValue.cuentaId, 'Tipo:', typeof formValue.cuentaId);

    // Validar que cuentaId no esté vacío
    const cuentaId = parseInt(formValue.cuentaId, 10);
    console.log('🔢 cuentaId después de parseInt:', cuentaId, 'isNaN:', isNaN(cuentaId));

    if (isNaN(cuentaId) || !formValue.cuentaId) {
      this.notificationService.error('Debe seleccionar una cuenta válida');
      this.saving.set(false);
      return;
    }

    // Prepare DTO for backend
    const movimientoDTO = {
      cuentaId: cuentaId,
      fecha: formValue.fecha,
      valor: parseFloat(formValue.valor),
      tipoMovimiento: formValue.tipoMovimiento
    };

    console.log('✅ Datos a enviar al backend:', JSON.stringify(movimientoDTO, null, 2));

    if (this.isEditMode() && this.movimientoId()) {
      // Update existing movimiento
      this.movimientosService.update(this.movimientoId()!, movimientoDTO).subscribe({
        next: (movimiento) => {
          this.notificationService.success('Movimiento actualizado correctamente');
          this.router.navigate(['/movimientos', movimiento.movimientoId]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error updating movimiento:', error);
        }
      });
    } else {
      // Create new movimiento
      this.movimientosService.create(movimientoDTO).subscribe({
        next: (movimiento) => {
          this.notificationService.success('Movimiento creado correctamente');
          this.router.navigate(['/movimientos', movimiento.movimientoId]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error creating movimiento:', error);
        }
      });
    }
  }

  private formatErrorMessage(error: any): string {
    // Extract message and details from backend error response
    const message = error?.error?.message || 'Error al procesar la solicitud';
    const details = error?.error?.details;

    if (!details || Object.keys(details).length === 0) {
      return message;
    }

    // Format details as bullet points
    const detailMessages = Object.entries(details)
      .map(([field, msg]) => `• ${field}: ${msg}`)
      .join('\n');

    return `${message}\n\n${detailMessages}`;
  }

  onCancel(): void {
    if (this.isEditMode() && this.movimientoId()) {
      this.router.navigate(['/movimientos', this.movimientoId()]);
    } else {
      this.router.navigate(['/movimientos']);
    }
  }
}
