import { DatePipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Coach } from '../../../core/models/coach.model';
import { Course } from '../../../core/models/course.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { MemberAccount, MemberActivity } from '../../../core/models/member.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { MemberActivityService } from '../../../core/services/member-activity.service';
import { MemberAuthService } from '../../../core/services/member-auth.service';
import { SelectionStoreService } from '../../../core/services/selection-store.service';

@Component({
  selector: 'app-member-dashboard-page',
  standalone: true,
  imports: [DatePipe, NgIf, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="page-section">
      <div class="page-shell dashboard-layout">
        <mat-card class="hero-panel dashboard-hero">
          <div class="dashboard-hero-top">
            <div>
              <span class="eyebrow">Espace membre</span>
              <h1>Bonjour {{ member?.fullName ?? 'membre' }}, voici ton activité FitZone.</h1>
              <p>
                Un espace personnel pour suivre tes plans, coachs, cours et actions récentes.
              </p>
            </div>
            <div class="avatar">{{ initials }}</div>
          </div>

          <div class="dashboard-stats">
            <div class="stat-tile">
              <span class="stat-value">{{ activePlanLabel }}</span>
              <span class="muted">Plan actif</span>
            </div>
            <div class="stat-tile">
              <span class="stat-value">{{ activeCoachLabel }}</span>
              <span class="muted">Coachs actuels</span>
            </div>
            <div class="stat-tile">
              <span class="stat-value">{{ activeCourseCount }}</span>
              <span class="muted">Cours suivis</span>
            </div>
          </div>

          <div class="dashboard-actions">
            <a *ngIf="!hasPlan" mat-stroked-button routerLink="/pricing">Choisir un plan</a>
            <a mat-stroked-button routerLink="/coaches">Choisir un coach</a>
            <a mat-stroked-button routerLink="/courses">Ajouter un cours</a>
            <button *ngIf="hasCompleteSelection" mat-raised-button color="primary" (click)="confirmEnrollment()">Confirmer inscription</button>
          </div>
        </mat-card>

        <div class="grid dashboard-grid">
          <mat-card class="content-panel">
            <mat-card-header>
              <mat-card-title>Mon espace</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <nav class="member-subnav" aria-label="Navigation espace membre">
                <button
                  mat-stroked-button
                  type="button"
                  [class.member-subnav-active]="activeSection === 'coaches'"
                  (click)="setActiveSection('coaches')"
                >
                  Mes coachs
                </button>
                <button
                  mat-stroked-button
                  type="button"
                  [class.member-subnav-active]="activeSection === 'courses'"
                  (click)="setActiveSection('courses')"
                >
                  Mes cours
                </button>
              </nav>

              @if (activeSection === 'coaches') {
                @if (memberCoaches.length > 0) {
                  <div class="detail-list">
                    @for (coach of memberCoaches; track coach.id) {
                      <article class="detail-card">
                        <h3>{{ coach.name }}</h3>
                        <p class="muted">{{ coach.specialty }}</p>
                        <div class="detail-row"><span>Disponibilité</span><strong>{{ coach.availability }}</strong></div>
                        <p>{{ coach.bio }}</p>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty-state">Aucun coach inscrit pour le moment.</div>
                }
              } @else {
                @if (memberCourses.length > 0) {
                  <div class="detail-list">
                    @for (course of memberCourses; track course.id) {
                      <article class="detail-card">
                        <h3>{{ course.title }}</h3>
                        <p>{{ course.description }}</p>
                        <div class="detail-row"><span>Niveau</span><strong>{{ course.level }}</strong></div>
                        <div class="detail-row"><span>Durée</span><strong>{{ course.duration }}</strong></div>
                        <div class="detail-row"><span>Horaire</span><strong>{{ course.schedule }}</strong></div>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty-state">Aucun cours inscrit pour le moment.</div>
                }
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid dashboard-grid">
          <mat-card class="content-panel">
            <mat-card-header>
              <mat-card-title>Historique des actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (filteredActivities.length > 0) {
                <div class="timeline">
                  @for (activity of filteredActivities; track activity.id) {
                    <div class="timeline-item">
                      <span class="timeline-dot"></span>
                      <div>
                        <strong>{{ activity.action }}</strong>
                        <p>{{ activity.details }}</p>
                        <small>{{ activity.createdAt | date:'short' }}</small>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">Aucune action enregistrée pour le moment.</div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dashboard-layout {
      display: grid;
      gap: 24px;
    }

    .dashboard-hero {
      padding: 32px;
    }

    .dashboard-hero-top {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--fz-muted);
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    h1 {
      font-size: clamp(2.4rem, 5vw, 4.5rem);
      line-height: 0.95;
      max-width: 14ch;
      margin-bottom: 12px;
    }

    .dashboard-hero p {
      color: var(--fz-muted);
      max-width: 62ch;
      margin-bottom: 0;
    }

    .avatar {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-accent));
      box-shadow: 0 18px 30px rgba(226, 61, 77, 0.25);
      flex: 0 0 auto;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin: 28px 0;
    }

    .stat-tile {
      padding: 16px;
      border-radius: 18px;
      border: 1px solid var(--fz-border);
      background: rgba(255, 255, 255, 0.04);
    }

    .stat-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .dashboard-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .member-subnav {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
    }

    .member-subnav-active {
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-primary-strong));
      color: #fff;
      border-color: transparent;
    }

    .detail-list {
      display: grid;
      gap: 14px;
    }

    .detail-card {
      border: 1px solid var(--fz-border);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.03);
      padding: 14px 16px;
    }

    .detail-card h3 {
      margin: 0 0 8px;
      font-size: 1.1rem;
    }

    .detail-card p {
      margin: 8px 0;
    }

    .detail-row,
    .detail-block {
      border: 1px solid var(--fz-border);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.03);
      padding: 14px 16px;
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .detail-row span,
    .detail-block span {
      color: var(--fz-muted);
      display: block;
      margin-bottom: 4px;
    }

    .detail-block strong,
    .detail-row strong {
      display: block;
    }

    .timeline {
      display: grid;
      gap: 14px;
    }

    .timeline-item {
      display: grid;
      grid-template-columns: 12px 1fr;
      gap: 12px;
      align-items: start;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      margin-top: 6px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-accent));
      box-shadow: 0 0 0 6px rgba(226, 61, 77, 0.12);
    }

    .timeline-item p {
      margin: 4px 0;
      color: var(--fz-muted);
    }

    @media (max-width: 900px) {
      .dashboard-stats,
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-hero-top {
        flex-direction: column;
      }
    }
  `]
})
export class MemberDashboardPageComponent implements OnInit, OnDestroy {
  activeSection: 'coaches' | 'courses' = 'coaches';
  member: MemberAccount | null = null;
  selectionSnapshot = this.selectionStoreService.snapshot;
  memberActivities: MemberActivity[] = [];
  memberEnrollments: Enrollment[] = [];

  private readonly subscription = new Subscription();

  constructor(
    private readonly memberAuthService: MemberAuthService,
    private readonly memberActivityService: MemberActivityService,
    private readonly selectionStoreService: SelectionStoreService,
    private readonly enrollmentService: EnrollmentService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.memberAuthService.currentMember$.subscribe((member) => {
        this.member = member;
        this.refreshDerivedData();
      })
    );

    this.subscription.add(
      this.memberActivityService.activities$.subscribe(() => {
        this.refreshDerivedData();
      })
    );

    this.subscription.add(
      this.enrollmentService.enrollments$.subscribe(() => {
        this.refreshDerivedData();
      })
    );

    this.subscription.add(
      this.selectionStoreService.selection$.subscribe((selection) => {
        this.selectionSnapshot = selection;
      })
    );

    this.refreshDerivedData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get initials(): string {
    if (!this.member?.fullName) {
      return 'FZ';
    }

    return this.member.fullName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  get activePlanLabel(): string {
    if (this.memberEnrollments.length > 0) {
      return this.memberEnrollments[0].plan.name;
    }

    if (this.selectionSnapshot.plan) {
      return `${this.selectionSnapshot.plan.name} (en attente)`;
    }

    return 'Aucun';
  }

  get hasPlan(): boolean {
    return this.memberEnrollments.length > 0 || !!this.selectionSnapshot.plan;
  }

  get hasCompleteSelection(): boolean {
    if (!this.selectionSnapshot.plan) {
      return false;
    }

    const hasRequiredCoach = this.selectionSnapshot.plan.maxCoaches === 0 || this.selectionSnapshot.coaches.length > 0;
    return hasRequiredCoach && this.selectionSnapshot.courses.length > 0;
  }

  get activeCoachLabel(): string {
    if (this.memberCoaches.length > 0) {
      return this.memberCoaches.map((coach) => coach.name).join(', ');
    }

    return 'Aucun';
  }

  get activeCourseCount(): number {
    return this.memberCourses.length;
  }

  get memberCoaches(): Coach[] {
    const uniqueCoaches = new Map<string, Coach>();

    for (const enrollment of this.memberEnrollments) {
      for (const coach of enrollment.coaches) {
        uniqueCoaches.set(coach.id, coach);
      }
    }

    for (const coach of this.selectionSnapshot.coaches) {
      uniqueCoaches.set(coach.id, coach);
    }

    return Array.from(uniqueCoaches.values());
  }

  get memberCourses(): Course[] {
    const uniqueCourses = new Map<string, Course>();

    for (const enrollment of this.memberEnrollments) {
      for (const course of enrollment.courses) {
        uniqueCourses.set(course.id, course);
      }
    }

    for (const course of this.selectionSnapshot.courses) {
      uniqueCourses.set(course.id, course);
    }

    return Array.from(uniqueCourses.values());
  }

  get filteredActivities() {
    const uniqueActions = new Map<string, MemberActivity>();
    for (const activity of this.memberActivities) {
      if (!uniqueActions.has(activity.action)) {
        uniqueActions.set(activity.action, activity);
      }
    }
    return Array.from(uniqueActions.values());
  }

  setActiveSection(section: 'coaches' | 'courses'): void {
    this.activeSection = section;
  }

  private refreshDerivedData(): void {
    if (!this.member) {
      this.memberActivities = [];
      this.memberEnrollments = [];
      return;
    }

    this.memberActivities = this.memberActivityService.getForMember(this.member.email);
    this.memberEnrollments = this.enrollmentService
      .getAll()
      .filter((enrollment) => enrollment.email === this.member?.email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  confirmEnrollment(): void {
    if (!this.member || !this.hasCompleteSelection) {
      return;
    }

    const validationError = this.enrollmentService.validateSelection(
      this.selectionSnapshot.plan!,
      this.selectionSnapshot.coaches,
      this.selectionSnapshot.courses,
      this.member.email
    );

    if (validationError) {
      return;
    }

    const enrollment = this.enrollmentService.create({
      fullName: this.member.fullName,
      phone: this.member.phone,
      email: this.member.email,
      password: this.member.password, // Assuming member has password
      plan: this.selectionSnapshot.plan!,
      coaches: this.selectionSnapshot.coaches,
      coach: this.selectionSnapshot.coach || this.selectionSnapshot.coaches[0] || null,
      courses: this.selectionSnapshot.courses
    });

    this.router.navigate(['/confirmation', enrollment.id]);
  }
}
