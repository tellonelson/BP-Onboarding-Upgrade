import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoCuenta } from '../../core/models/estado-cuenta.model';
import { EstadoCuentaService } from './estado-cuenta.service';
import { PdfReportService } from './pdf-report.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-reportes-placeholder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Estado de Cuenta</h1>
        <p class="mt-1 text-sm text-gray-500">
          Resumen de saldos y movimientos de todas las cuentas bancarias
        </p>
      </div>

      <!-- Loading State -->
      @if (estadoCuentaService.loading()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Table -->
      @if (!estadoCuentaService.loading() && cuentas().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Cuenta
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Inicial
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crédito
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Débito
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Movimiento
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (cuenta of cuentas(); track cuenta.numeroCuenta) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ cuenta.numeroCuenta }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ cuenta.nombreCliente }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span [class]="getTipoCuentaClass(cuenta.tipoCuenta)">
                        {{ cuenta.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {{ formatCurrency(cuenta.saldoInicial) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      {{ formatCurrency(cuenta.credito) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                      {{ formatCurrency(cuenta.debito) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold" [class]="getSaldoClass(cuenta.saldo)">
                      {{ formatCurrency(cuenta.saldo) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ cuenta.ultimoMovimiento }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        (click)="openReportModal(cuenta)"
                        class="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Generar reporte"
                      >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!estadoCuentaService.loading() && cuentas().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg shadow">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay estados de cuenta</h3>
          <p class="mt-1 text-sm text-gray-500">No se encontraron cuentas con movimientos.</p>
        </div>
      }
    </div>

    <!-- Modal de Rango de Fechas -->
    <app-modal #reportModal [size]="'md'">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Generar Reporte</h3>
        @if (selectedCuenta()) {
          <p class="text-sm text-gray-600 mb-4">
            Cuenta: <span class="font-semibold">{{ selectedCuenta()!.numeroCuenta }}</span> - {{ selectedCuenta()!.nombreCliente }}
          </p>
        }

        <form [formGroup]="reportForm" (ngSubmit)="generateReport()" class="space-y-4">
          <!-- Fecha Inicio -->
          <div>
            <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio <span class="text-red-500">*</span>
            </label>
            <input
              id="fechaInicio"
              type="date"
              formControlName="fechaInicio"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="reportForm.get('fechaInicio')?.invalid && reportForm.get('fechaInicio')?.touched"
            />
            @if (reportForm.get('fechaInicio')?.invalid && reportForm.get('fechaInicio')?.touched) {
              <p class="mt-1 text-sm text-red-600">La fecha de inicio es requerida</p>
            }
          </div>

          <!-- Fecha Fin -->
          <div>
            <label for="fechaFin" class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin <span class="text-red-500">*</span>
            </label>
            <input
              id="fechaFin"
              type="date"
              formControlName="fechaFin"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="reportForm.get('fechaFin')?.invalid && reportForm.get('fechaFin')?.touched"
            />
            @if (reportForm.get('fechaFin')?.invalid && reportForm.get('fechaFin')?.touched) {
              <p class="mt-1 text-sm text-red-600">La fecha fin es requerida</p>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <app-button
              [type]="'submit'"
              [variant]="'primary'"
              [disabled]="reportForm.invalid || generatingReport()"
              [loading]="generatingReport()"
            >
              Generar Reporte
            </app-button>
            <app-button
              [type]="'button'"
              [variant]="'secondary'"
              [disabled]="generatingReport()"
              (clicked)="closeReportModal()"
            >
              Cancelar
            </app-button>
          </div>
        </form>
      </div>
    </app-modal>
  `
})
export class ReportesPlaceholderComponent implements OnInit {
  private fb = inject(FormBuilder);
  estadoCuentaService = inject(EstadoCuentaService);
  pdfReportService = inject(PdfReportService);
  notificationService = inject(NotificationService);

  reportModal = viewChild.required<ModalComponent>('reportModal');

  cuentas = signal<EstadoCuenta[]>([]);
  selectedCuenta = signal<EstadoCuenta | null>(null);
  generatingReport = signal(false);

  reportForm = this.fb.group({
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadEstadosCuenta();
  }

  private loadEstadosCuenta(): void {
    this.estadoCuentaService.getAll().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
      },
      error: (error) => {
        this.notificationService.error('Error al cargar los estados de cuenta');
        console.error('Error loading estados de cuenta:', error);
      }
    });
  }

  openReportModal(cuenta: EstadoCuenta): void {
    this.selectedCuenta.set(cuenta);
    this.reportForm.reset();
    this.reportModal().open();
  }

  closeReportModal(): void {
    this.selectedCuenta.set(null);
    this.reportModal().close();
  }

  generateReport(): void {
    if (this.reportForm.invalid || !this.selectedCuenta()) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const { fechaInicio, fechaFin } = this.reportForm.value;
    const cuenta = this.selectedCuenta()!;

    this.generatingReport.set(true);
    this.pdfReportService.generarReporteCuenta(cuenta, fechaInicio!, fechaFin!).subscribe({
      next: () => {
        this.notificationService.success('Reporte generado correctamente');
        this.generatingReport.set(false);
        this.closeReportModal();
      },
      error: (error) => {
        this.notificationService.error('Error al generar el reporte');
        this.generatingReport.set(false);
        console.error('Error generating report:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  }

  getTipoCuentaClass(tipo: string): string {
    if (tipo === 'AHORROS') {
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
    }
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800';
  }

  getSaldoClass(saldo: number): string {
    if (saldo > 0) {
      return 'text-green-600';
    } else if (saldo < 0) {
      return 'text-red-600';
    }
    return 'text-gray-900';
  }
}
