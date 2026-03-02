import { Component, signal, input, output, viewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <app-modal #modal [title]="title()" [size]="'sm'" [closable]="true" (closed)="handleClose()">
      <div class="text-gray-600">
        {{ message() }}
      </div>

      <div footer class="flex justify-end gap-3 p-6 border-t bg-gray-50 -m-6 mt-6 rounded-b-lg">
        <app-button
          [variant]="'secondary'"
          (clicked)="handleCancel()"
        >
          {{ cancelText() }}
        </app-button>
        <app-button
          [variant]="confirmVariant()"
          (clicked)="handleConfirm()"
        >
          {{ confirmText() }}
        </app-button>
      </div>
    </app-modal>
  `
})
export class ConfirmationDialogComponent {
  modal = viewChild.required<ModalComponent>('modal');

  title = input<string>('Confirmar acción');
  message = input<string>('¿Está seguro que desea continuar?');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  confirmVariant = input<'primary' | 'danger'>('primary');

  confirmed = output<boolean>();

  open(): void {
    this.modal().open();
  }

  close(): void {
    this.modal().close();
  }

  handleConfirm(): void {
    this.confirmed.emit(true);
    this.close();
  }

  handleCancel(): void {
    this.confirmed.emit(false);
    this.close();
  }

  handleClose(): void {
    this.confirmed.emit(false);
  }
}
