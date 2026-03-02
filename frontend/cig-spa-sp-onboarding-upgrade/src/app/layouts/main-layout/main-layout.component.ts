import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside
        [class]="sidebarCollapsed() ? 'w-20' : 'w-64'"
        class="transition-all duration-300 hidden md:block"
      >
        <app-sidebar />
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-header />

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Mobile Sidebar (overlay) -->
    @if (showMobileSidebar()) {
      <div class="md:hidden fixed inset-0 z-50">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50"
          (click)="showMobileSidebar.set(false)"
        ></div>

        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <app-sidebar />
        </aside>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  showMobileSidebar = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(val => !val);
  }
}
