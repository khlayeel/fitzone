import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MemberAuthService } from '../../../core/services/member-auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule, MatToolbarModule],
  template: `
    <mat-toolbar class="no-print">
      <div class="page-shell toolbar-content">
        <a class="brand" routerLink="/">FitZone</a>
        <div class="toolbar-spacer"></div>
        <nav class="desktop-nav">
          <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
          <a mat-button routerLink="/courses" routerLinkActive="active-link">Cours</a>
          <a mat-button routerLink="/coaches" routerLinkActive="active-link">Coachs</a>
          <a mat-button routerLink="/pricing" routerLinkActive="active-link">Tarifs</a>
          
        </nav>
        @if (memberAuthService.currentMember$ | async; as member) {
          <div class="toolbar-actions">
            <a mat-stroked-button routerLink="/account">Mon espace</a>
            <button mat-flat-button color="primary" class="login-button" (click)="logout()">Déconnexion</button>
          </div>
        } @else {
          <div class="toolbar-actions">
            <a mat-stroked-button routerLink="/login">Login</a>
            <a mat-flat-button color="primary" class="login-button" routerLink="/register">Inscription</a>
          </div>
        }
        <button mat-stroked-button [matMenuTriggerFor]="mobileMenu" class="mobile-menu" aria-label="Menu">
          Menu
        </button>
      </div>
    </mat-toolbar>

    <mat-menu #mobileMenu="matMenu">
      <a mat-menu-item routerLink="/">Accueil</a>
      <a mat-menu-item routerLink="/courses">Cours</a>
      <a mat-menu-item routerLink="/coaches">Coachs</a>
      <a mat-menu-item routerLink="/pricing">Tarifs</a>
      <a mat-menu-item routerLink="/admin">Admin</a>
      @if (memberAuthService.currentMember$ | async; as member) {
        <a mat-menu-item routerLink="/account">Mon espace</a>
        <button mat-menu-item (click)="logout()">Déconnexion</button>
      } @else {
        <a mat-menu-item routerLink="/login">Login</a>
        <a mat-menu-item routerLink="/register">Inscription</a>
      }
    </mat-menu>
  `,
  styles: [`
    .toolbar-content {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 76px;
    }

    .brand {
      font-family: 'Bahnschrift SemiBold', 'Arial Black', sans-serif;
      font-size: 1.65rem;
      letter-spacing: 0.1em;
      color: var(--fz-primary-strong);
      text-transform: uppercase;
    }

    .desktop-nav {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .active-link {
      color: #fff;
      background: rgba(255, 107, 107, 0.16);
      border-radius: 999px;
    }

    .login-button {
      margin-left: 8px;
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-primary-strong));
      color: #fff;
      box-shadow: 0 16px 28px rgba(226, 61, 77, 0.28);
    }

    .mobile-menu {
      display: none;
    }

    @media (max-width: 900px) {
      .desktop-nav {
        display: none;
      }

      .toolbar-actions {
        margin-right: 10px;
      }

      .mobile-menu {
        display: inline-flex;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public readonly memberAuthService: MemberAuthService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.memberAuthService.logout();
    this.router.navigate(['/']);
  }
}
