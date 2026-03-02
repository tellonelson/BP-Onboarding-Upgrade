import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_PREFIX = 'banking_app_';

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(
        this.STORAGE_PREFIX + key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}
