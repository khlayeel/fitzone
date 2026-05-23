import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MemberAuthService } from '../../../core/services/member-auth.service';

@Component({
  selector: 'app-member-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page-section">
      <div class="page-shell auth-shell">
        <div class="auth-copy hero-panel">
          <span class="eyebrow">Connexion membre</span>
          <h1>Accède à ton espace FitZone.</h1>
          <p>
            Retrouve tes plans, tes coachs, tes cours et tout l’historique de tes actions dans une interface claire.
          </p>
          <div class="auth-points">
            <div>Suivi de tes inscriptions</div>
            <div>Historique des actions</div>
            <div>Accès rapide aux réservations</div>
          </div>
        </div>

        <mat-card class="auth-card content-panel">
          <mat-card-header>
            <mat-card-title>Connexion</mat-card-title>
            <mat-card-subtitle>Utilise ton email et ton mot de passe membre.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="login()" class="auth-form">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mot de passe</mat-label>
                <input matInput type="password" formControlName="password" />
              </mat-form-field>

              @if (errorMessage) {
                <p class="error-text">{{ errorMessage }}</p>
              }

              <div class="auth-actions">
                <button mat-raised-button color="primary" type="submit">Se connecter</button>
                <a mat-button routerLink="/register">Créer un compte</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .auth-shell {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
      align-items: stretch;
    }

    .auth-copy,
    .auth-card {
      padding: 32px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--fz-muted);
      font-size: 0.85rem;
      margin-bottom: 18px;
    }

    h1 {
      font-size: clamp(2.5rem, 5vw, 4.5rem);
      line-height: 0.95;
      max-width: 12ch;
      margin-bottom: 16px;
    }

    .auth-copy p {
      color: var(--fz-muted);
      max-width: 54ch;
      margin-bottom: 24px;
    }

    .auth-points {
      display: grid;
      gap: 10px;
      color: var(--fz-text);
    }

    .auth-points div {
      padding: 14px 16px;
      border: 1px solid var(--fz-border);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
    }

    .auth-form {
      display: grid;
      gap: 12px;
      margin-top: 12px;
    }

    .auth-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }

    .error-text {
      color: #ff8a80;
      margin: 0;
    }

    @media (max-width: 900px) {
      .auth-shell {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MemberLoginPageComponent implements OnInit {
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly memberAuthService: MemberAuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.memberAuthService.isAuthenticated()) {
      this.router.navigateByUrl(this.getSafeReturnUrl());
    }
  }

  login(): void {
    this.errorMessage = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const isAuthenticated = this.memberAuthService.login(this.form.getRawValue());
    if (!isAuthenticated) {
      this.errorMessage = 'Email ou mot de passe invalide.';
      return;
    }

    this.router.navigateByUrl(this.getSafeReturnUrl());
  }

  private getSafeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!returnUrl || returnUrl === '/enroll') {
      return '/account';
    }

    return returnUrl;
  }
}