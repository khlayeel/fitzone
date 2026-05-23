import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private readonly storageService: StorageService) {}

  isAuthenticated(): boolean {
    return this.storageService.getItem<string | null>(STORAGE_KEYS.adminToken, null) === 'fitzone-admin';
  }

  login(pin: string): boolean {
    const isValid = pin === environment.adminPin;
    if (isValid) {
      this.storageService.setItem(STORAGE_KEYS.adminToken, 'fitzone-admin');
    }
    return isValid;
  }

  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.adminToken);
  }
}
