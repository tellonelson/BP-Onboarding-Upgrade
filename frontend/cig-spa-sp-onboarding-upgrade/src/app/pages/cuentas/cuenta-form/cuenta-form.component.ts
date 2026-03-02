import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CuentasService } from '../cuentas.service';
import { ClientesService } from '../../clientes/clientes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TipoCuentaEnum } from '../../../core/models/cuenta.model';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-cuenta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="max-w-3xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode() ? 'Editar Cuenta' : 'Nueva Cuenta' }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ isEditMode() ? 'Actualiza la información de la cuenta' : 'Completa el formulario para crear una nueva cuenta' }}
        </p>
      </div>

      <!-- Loading Clientes -->
      @if (loadingClientes()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Form -->
      @if (!loadingClientes()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Cliente -->
            <div class="md:col-span-2">
              <label for="clienteId" class="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span class="text-red-500">*</span>
              </label>
              <select
                id="clienteId"
                formControlName="clienteId"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('clienteId')?.invalid && form.get('clienteId')?.touched"
              >
                <option value="">Seleccione un cliente</option>
                @for (cliente of clientes(); track cliente.id) {
                  <option [value]="cliente.id">
                    {{ cliente.nombre }} - {{ cliente.identificacion }}
                  </option>
                }
              </select>
              @if (form.get('clienteId')?.invalid && form.get('clienteId')?.touched) {
                <p class="mt-1 text-sm text-red-600">El cliente es requerido</p>
              }
            </div>

            <!-- Número de Cuenta -->
            <div>
              <label for="numeroCuenta" class="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuenta <span class="text-red-500">*</span>
              </label>
              <input
                id="numeroCuenta"
                type="text"
                formControlName="numeroCuenta"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('numeroCuenta')?.invalid && form.get('numeroCuenta')?.touched"
                placeholder="Ej: 1234567890"
              />
              @if (form.get('numeroCuenta')?.invalid && form.get('numeroCuenta')?.touched) {
                <p class="mt-1 text-sm text-red-600">
                  @if (form.get('numeroCuenta')?.errors?.['required']) {
                    El número de cuenta es requerido
                  }
                  @if (form.get('numeroCuenta')?.errors?.['minlength']) {
                    El número de cuenta debe tener al menos 10 caracteres
                  }
                </p>
              }
            </div>

            <!-- Tipo de Cuenta -->
            <div>
              <label for="tipoCuenta" class="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cuenta <span class="text-red-500">*</span>
              </label>
              <select
                id="tipoCuenta"
                formControlName="tipoCuenta"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('tipoCuenta')?.invalid && form.get('tipoCuenta')?.touched"
              >
                <option value="">Seleccione un tipo</option>
                <option [value]="TipoCuentaEnum.AHORROS">Ahorros</option>
                <option [value]="TipoCuentaEnum.CORRIENTE">Corriente</option>
              </select>
              @if (form.get('tipoCuenta')?.invalid && form.get('tipoCuenta')?.touched) {
                <p class="mt-1 text-sm text-red-600">El tipo de cuenta es requerido</p>
              }
            </div>

            <!-- Saldo Inicial -->
            <div>
              <label for="saldoInicial" class="block text-sm font-medium text-gray-700 mb-1">
                Saldo Inicial <span class="text-red-500">*</span>
              </label>
              <input
                id="saldoInicial"
                type="number"
                formControlName="saldoInicial"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="form.get('saldoInicial')?.invalid && form.get('saldoInicial')?.touched"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              @if (form.get('saldoInicial')?.invalid && form.get('saldoInicial')?.touched) {
                <p class="mt-1 text-sm text-red-600">
                  @if (form.get('saldoInicial')?.errors?.['required']) {
                    El saldo inicial es requerido
                  }
                  @if (form.get('saldoInicial')?.errors?.['min']) {
                    El saldo inicial debe ser mayor o igual a 0
                  }
                </p>
              }
            </div>

            <!-- Estado de la Cuenta -->
            @if (isEditMode()) {
              <div>
                <label for="estadoCuenta" class="block text-sm font-medium text-gray-700 mb-1">
                  Estado de la Cuenta
                </label>
                <select
                  id="estadoCuenta"
                  formControlName="estado"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option [value]="true">Activa</option>
                  <option [value]="false">Inactiva</option>
                </select>
              </div>
            }
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
              {{ isEditMode() ? 'Actualizar' : 'Crear' }} Cuenta
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
export class CuentaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cuentasService = inject(CuentasService);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationService);

  // Expose enum to template
  TipoCuentaEnum = TipoCuentaEnum;

  form!: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  loadingClientes = signal(false);
  cuentaId = signal<number | null>(null);
  clientes = signal<Cliente[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadClientes();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      clienteId: ['', [Validators.required]],
      numeroCuenta: ['', [Validators.required, Validators.minLength(10)]],
      tipoCuenta: ['', [Validators.required]],
      saldoInicial: [0, [Validators.required, Validators.min(0)]],
      estado: [true]
    });
  }

  private loadClientes(): void {
    this.loadingClientes.set(true);
    this.clientesService.getAll({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.clientes.set(response.content);
        this.loadingClientes.set(false);
      },
      error: (error) => {
        this.notificationService.error('Error al cargar los clientes');
        this.loadingClientes.set(false);
        console.error('Error loading clientes:', error);
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.cuentaId.set(parseInt(id, 10));
      this.loadCuenta(parseInt(id, 10));
    }
  }

  private loadCuenta(id: number): void {
    this.cuentasService.getById(id).subscribe({
      next: (cuenta) => {
        this.form.patchValue({
          clienteId: cuenta.cliente.id,
          numeroCuenta: cuenta.numeroCuenta,
          tipoCuenta: cuenta.tipoCuenta,
          saldoInicial: cuenta.saldoInicial,
          estado: cuenta.estado
        });
      },
      error: (error) => {
        this.notificationService.error('Cuenta no encontrada');
        this.router.navigate(['/cuentas']);
        console.error('Error loading cuenta:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    // Prepare DTO for backend
    const cuentaDTO = {
      numeroCuenta: formValue.numeroCuenta,
      tipoCuenta: formValue.tipoCuenta,
      saldoInicial: formValue.saldoInicial,
      estado: formValue.estado === 'false' ? false : Boolean(formValue.estado),
      clienteId: parseInt(formValue.clienteId, 10)
    };

    if (this.isEditMode() && this.cuentaId()) {
      // Update existing cuenta
      this.cuentasService.update(this.cuentaId()!, cuentaDTO).subscribe({
        next: (cuenta) => {
          this.notificationService.success('Cuenta actualizada correctamente');
          this.router.navigate(['/cuentas', cuenta.cuentaId]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error updating cuenta:', error);
        }
      });
    } else {
      // Create new cuenta
      this.cuentasService.create(cuentaDTO).subscribe({
        next: (cuenta) => {
          this.notificationService.success('Cuenta creada correctamente');
          this.router.navigate(['/cuentas', cuenta.cuentaId]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error creating cuenta:', error);
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
    if (this.isEditMode() && this.cuentaId()) {
      this.router.navigate(['/cuentas', this.cuentaId()]);
    } else {
      this.router.navigate(['/cuentas']);
    }
  }
}
