import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../clientes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GeneroEnum } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="max-w-3xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ isEditMode() ? 'Actualiza la información del cliente' : 'Completa el formulario para crear un nuevo cliente' }}
        </p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo <span class="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
              placeholder="Ej: Juan Pérez García"
            />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (form.get('nombre')?.errors?.['required']) {
                  El nombre es requerido
                }
                @if (form.get('nombre')?.errors?.['minlength']) {
                  El nombre debe tener al menos 3 caracteres
                }
              </p>
            }
          </div>

          <!-- Identificación -->
          <div>
            <label for="identificacion" class="block text-sm font-medium text-gray-700 mb-1">
              Identificación <span class="text-red-500">*</span>
            </label>
            <input
              id="identificacion"
              type="text"
              formControlName="identificacion"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('identificacion')?.invalid && form.get('identificacion')?.touched"
              placeholder="Ej: 1234567890"
            />
            @if (form.get('identificacion')?.invalid && form.get('identificacion')?.touched) {
              <p class="mt-1 text-sm text-red-600">La identificación es requerida</p>
            }
          </div>

          <!-- Edad -->
          <div>
            <label for="edad" class="block text-sm font-medium text-gray-700 mb-1">
              Edad <span class="text-red-500">*</span>
            </label>
            <input
              id="edad"
              type="number"
              formControlName="edad"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('edad')?.invalid && form.get('edad')?.touched"
              placeholder="18"
              min="18"
              max="120"
            />
            @if (form.get('edad')?.invalid && form.get('edad')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (form.get('edad')?.errors?.['required']) {
                  La edad es requerida
                }
                @if (form.get('edad')?.errors?.['min']) {
                  La edad mínima es 18 años
                }
                @if (form.get('edad')?.errors?.['max']) {
                  La edad máxima es 120 años
                }
              </p>
            }
          </div>

          <!-- Género -->
          <div>
            <label for="genero" class="block text-sm font-medium text-gray-700 mb-1">
              Género <span class="text-red-500">*</span>
            </label>
            <select
              id="genero"
              formControlName="genero"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('genero')?.invalid && form.get('genero')?.touched"
            >
              <option value="">Seleccione un género</option>
              <option [value]="GeneroEnum.MASCULINO">Masculino</option>
              <option [value]="GeneroEnum.FEMENINO">Femenino</option>
              <option [value]="GeneroEnum.OTRO">Otro</option>
            </select>
            @if (form.get('genero')?.invalid && form.get('genero')?.touched) {
              <p class="mt-1 text-sm text-red-600">El género es requerido</p>
            }
          </div>

          <!-- Teléfono -->
          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span class="text-red-500">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              formControlName="telefono"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('telefono')?.invalid && form.get('telefono')?.touched"
              placeholder="Ej: +57 300 1234567"
            />
            @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
              <p class="mt-1 text-sm text-red-600">El teléfono es requerido</p>
            }
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2">
            <label for="direccion" class="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span class="text-red-500">*</span>
            </label>
            <input
              id="direccion"
              type="text"
              formControlName="direccion"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('direccion')?.invalid && form.get('direccion')?.touched"
              placeholder="Ej: Calle 123 #45-67, Bogotá"
            />
            @if (form.get('direccion')?.invalid && form.get('direccion')?.touched) {
              <p class="mt-1 text-sm text-red-600">La dirección es requerida</p>
            }
          </div>

          <!-- Contraseña -->
          <div>
            <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span class="text-red-500">*</span>
            </label>
            <input
              id="contrasena"
              type="password"
              formControlName="contrasena"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="form.get('contrasena')?.invalid && form.get('contrasena')?.touched"
              placeholder="Mínimo 6 caracteres"
            />
            @if (form.get('contrasena')?.invalid && form.get('contrasena')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (form.get('contrasena')?.errors?.['required']) {
                  La contraseña es requerida
                }
                @if (form.get('contrasena')?.errors?.['minlength']) {
                  La contraseña debe tener al menos 6 caracteres
                }
              </p>
            }
          </div>

          <!-- Estado (solo en modo edición) -->
          @if (isEditMode()) {
            <div>
              <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                formControlName="estado"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option [value]="true">Activo</option>
                <option [value]="false">Inactivo</option>
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
            {{ isEditMode() ? 'Actualizar' : 'Crear' }} Cliente
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
    </div>
  `
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationService);

  // Expose enum to template
  GeneroEnum = GeneroEnum;

  form!: FormGroup;
  isEditMode = signal(false);
  saving = signal(false);
  clienteId = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      identificacion: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      genero: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      estado: [true]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.clienteId.set(parseInt(id, 10));
      this.loadCliente(parseInt(id, 10));
    }
  }

  private loadCliente(id: number): void {
    this.clientesService.getById(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          nombre: cliente.nombre,
          identificacion: cliente.identificacion,
          edad: cliente.edad,
          genero: cliente.genero,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          contrasena: cliente.contrasena,
          estado: cliente.estado
        });
      },
      error: (error) => {
        this.notificationService.error('Cliente no encontrado');
        this.router.navigate(['/clientes']);
        console.error('Error loading cliente:', error);
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

    if (this.isEditMode() && this.clienteId()) {
      // Update existing client
      this.clientesService.update(this.clienteId()!, formValue).subscribe({
        next: (cliente) => {
          this.notificationService.success('Cliente actualizado correctamente');
          this.router.navigate(['/clientes', cliente.id]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error updating cliente:', error);
        }
      });
    } else {
      // Create new client
      this.clientesService.create(formValue).subscribe({
        next: (cliente) => {
          this.notificationService.success('Cliente creado correctamente');
          this.router.navigate(['/clientes', cliente.id]);
        },
        error: (error) => {
          const errorMessage = this.formatErrorMessage(error);
          this.notificationService.error(errorMessage);
          this.saving.set(false);
          console.error('Error creating cliente:', error);
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
    if (this.isEditMode() && this.clienteId()) {
      this.router.navigate(['/clientes', this.clienteId()]);
    } else {
      this.router.navigate(['/clientes']);
    }
  }
}
