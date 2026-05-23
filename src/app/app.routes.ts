import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { memberAuthGuard } from './core/guards/member-auth.guard';
import { AdminDashboardPageComponent } from './pages/admin/dashboard/admin-dashboard-page.component';
import { AdminLoginPageComponent } from './pages/admin/login/admin-login-page.component';
import { CoachesPageComponent } from './pages/coaches/coaches-page.component';
import { ConfirmationPageComponent } from './pages/confirmation/confirmation-page.component';
import { CoursesPageComponent } from './pages/courses/courses-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { PricingPageComponent } from './pages/pricing/pricing-page.component';
import { MemberDashboardPageComponent } from './pages/member/dashboard/member-dashboard-page.component';
import { MemberLoginPageComponent } from './pages/member/login/member-login-page.component';
import { MemberRegisterPageComponent } from './pages/member/register/member-register-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'FitZone | Accueil' },
  { path: 'courses', canActivate: [memberAuthGuard], component: CoursesPageComponent, title: 'FitZone | Cours' },
  { path: 'coaches', canActivate: [memberAuthGuard], component: CoachesPageComponent, title: 'FitZone | Coachs' },
  { path: 'pricing', canActivate: [memberAuthGuard], component: PricingPageComponent, title: 'FitZone | Tarifs' },
  { path: 'confirmation/:id', canActivate: [memberAuthGuard], component: ConfirmationPageComponent, title: 'FitZone | Confirmation' },
  { path: 'login', redirectTo: 'member/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'member/register', pathMatch: 'full' },
  { path: 'account', redirectTo: 'member/dashboard', pathMatch: 'full' },
  { path: 'member/login', component: MemberLoginPageComponent, title: 'FitZone | Connexion membre' },
  { path: 'member/register', component: MemberRegisterPageComponent, title: 'FitZone | Inscription membre' },
  { path: 'member/dashboard', canActivate: [memberAuthGuard], component: MemberDashboardPageComponent, title: 'FitZone | Mon espace' },
  { path: 'admin/login', component: AdminLoginPageComponent, title: 'FitZone | Admin Login' },
  { path: 'admin', canActivate: [adminAuthGuard], component: AdminDashboardPageComponent, title: 'FitZone | Admin' },
  { path: '**', redirectTo: '' }
];
