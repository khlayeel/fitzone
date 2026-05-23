import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AdminAuthService } from '../../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <mat-card class="login-card content-panel">
          <mat-card-header>
            <mat-card-title>Connexion admin</mat-card-title>
            <mat-card-subtitle>Accès sécurisé au tableau de bord FitZone.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="login()">
              <mat-form-field appearance="outline">
                <mat-label>PIN</mat-label>
                <input matInput type="password" formControlName="pin" maxlength="4" />
                @if (errorMessage) {
                  <mat-error>{{ errorMessage }}</mat-error>
                }
              </mat-form-field>
              <mat-card-actions>
                <button mat-raised-button color="primary" type="submit">Se connecter</button>
              </mat-card-actions>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .login-card {
      max-width: 460px;
      margin: 48px auto 0;
      padding: 8px;
    }

    .login-card mat-card-actions {
      padding: 0 16px 16px;
    }

    .login-card mat-card-content {
      padding-top: 12px;
    }
  `]
})
export class AdminLoginPageComponent {
  readonly form = this.formBuilder.nonNullable.group({
    pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]]
  });

  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router
  ) {}

  login(): void {
    this.errorMessage = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const isAuthenticated = this.adminAuthService.login(this.form.getRawValue().pin);
    if (!isAuthenticated) {
      this.errorMessage = 'PIN invalide.';
      return;
    }

    this.router.navigate(['/admin']);
  }
}
