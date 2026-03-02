import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="inputId()" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <input
        [id]="inputId()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [class]="getInputClasses()"
        [(ngModel)]="value"
      />

      @if (error()) {
        <p class="mt-1 text-sm text-red-600">
          {{ error() }}
        </p>
      }

      @if (hint() && !error()) {
        <p class="mt-1 text-sm text-gray-500">
          {{ hint() }}
        </p>
      }
    </div>
  `
})
export class InputComponent {
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  inputId = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);

  value = signal('');

  getInputClasses(): string {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
    const errorClasses = this.error()
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    const disabledClasses = this.disabled() ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  }
}
