import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col bg-gray-900 text-white">
      <!-- Logo/Brand -->
      <div class="p-6 border-b border-gray-700">
        <h1 class="text-xl font-bold">Banking App</h1>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        @for (item of menuItems; track item.label) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-blue-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" [innerHTML]="item.icon"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Clientes',
      route: '/clientes',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />'
    },
    {
      label: 'Cuentas',
      route: '/cuentas',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />'
    },
    {
      label: 'Movimientos',
      route: '/movimientos',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />'
    },
    {
      label: 'Reportes',
      route: '/reportes',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
    }
  ];
}
