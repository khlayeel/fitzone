import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Enrollment } from '../../core/models/enrollment.model';
import { EnrollmentService } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <section class="page-section">
      <div class="page-shell">
        @if (enrollment) {
          <mat-card class="content-panel confirmation-card">
            <mat-card-header>
              <mat-card-title>Confirmation d inscription</mat-card-title>
              <mat-card-subtitle>{{ enrollment.confirmationNumber }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Membre:</strong> {{ enrollment.fullName }}</p>
              <p><strong>Telephone:</strong> {{ enrollment.phone }}</p>
              <p><strong>Email:</strong> {{ enrollment.email }}</p>
              <p><strong>Plan:</strong> {{ enrollment.plan.name }} - {{ enrollment.plan.price }} DT</p>
              <p><strong>Coachs:</strong></p>
              @if (enrollment.coaches.length > 0) {
                <div class="chip-row">
                  @for (coach of enrollment.coaches; track coach.id) {
                    <mat-chip>{{ coach.name }} - {{ coach.specialty }}</mat-chip>
                  }
                </div>
              } @else {
                <p class="muted">Aucun coach pour ce plan.</p>
              }
              <p><strong>Date:</strong> {{ enrollment.createdAt | date:'medium' }}</p>
              <p><strong>Cours:</strong></p>
              <div class="chip-row">
                @for (course of enrollment.courses; track course.id) {
                  <mat-chip>{{ course.title }} • {{ course.schedule }}</mat-chip>
                }
              </div>
            </mat-card-content>
            <mat-card-actions class="no-print">
              <button mat-raised-button color="primary" (click)="print()">Telecharger</button>
              <a mat-button routerLink="/pricing">Voir les tarifs</a>
            </mat-card-actions>
          </mat-card>
        } @else {
          <div class="empty-state">
            Confirmation introuvable.
            <div style="margin-top: 16px;">
              <a mat-raised-button color="primary" routerLink="/pricing">Voir les tarifs</a>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .confirmation-card {
      padding: 12px;
    }
  `]
})
export class ConfirmationPageComponent implements OnInit {
  enrollment?: Enrollment;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.enrollment = this.enrollmentService.getById(id);
  }

  print(): void {
    window.print();
  }
}
