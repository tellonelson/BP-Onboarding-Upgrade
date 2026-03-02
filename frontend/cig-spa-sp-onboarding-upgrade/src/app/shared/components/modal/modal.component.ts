import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          (click)="handleBackdropClick()"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            [class]="getModalSizeClass()"
            class="relative bg-white rounded-lg shadow-xl w-full transform transition-all"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            @if (title() || closable()) {
              <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ title() }}
                </h3>
                @if (closable()) {
                  <button
                    (click)="close()"
                    class="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            }

            <!-- Content -->
            <div class="p-6">
              <ng-content></ng-content>
            </div>

            <!-- Footer (optional) -->
            <ng-content select="[footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  title = input<string>('');
  size = input<ModalSize>('md');
  closable = input<boolean>(true);

  isOpen = signal(false);
  closed = output<void>();

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  handleBackdropClick(): void {
    if (this.closable()) {
      this.close();
    }
  }

  getModalSizeClass(): string {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
      full: 'max-w-7xl'
    };
    return sizes[this.size()];
  }
}
