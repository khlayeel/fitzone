import { DatePipe, CommonModule, NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { Coach } from '../../../core/models/coach.model';
import { Course } from '../../../core/models/course.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Plan } from '../../../core/models/plan.model';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { CoachService } from '../../../core/services/coach.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PlanService } from '../../../core/services/plan.service';
import { CoachDialogComponent } from '../dialogs/coach-dialog.component';
import { CourseDialogComponent } from '../dialogs/course-dialog.component';
import { EnrollmentDetailDialogComponent } from '../dialogs/enrollment-detail-dialog.component';
import { PlanDialogComponent } from '../dialogs/plan-dialog.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    NgIf,
    NgFor,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTableModule,
    MatTabsModule
  ],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <div class="admin-header">
          <div>
            <h1 class="section-title">Dashboard admin</h1>
            <p class="section-subtitle">Gestion locale des plans, cours, coachs et inscriptions.</p>
          </div>
          <button mat-stroked-button color="warn" (click)="logout()">Se deconnecter</button>
        </div>

        <mat-tab-group dynamicHeight>
          <mat-tab label="Gestion Plans">
            <div class="admin-tab-content">
              <div class="table-actions">
                <button mat-raised-button color="primary" (click)="openPlanDialog()">Ajouter un plan</button>
              </div>
              <div class="table-wrapper">
                <table mat-table [dataSource]="plans" class="full-width">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let plan">{{ plan.name }}</td>
                  </ng-container>
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Prix</th>
                    <td mat-cell *matCellDef="let plan">{{ plan.price }} DT</td>
                  </ng-container>
                  <ng-container matColumnDef="popular">
                    <th mat-header-cell *matHeaderCellDef>Populaire</th>
                    <td mat-cell *matCellDef="let plan">{{ plan.popular ? 'Oui' : 'Non' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let plan">
                      <button mat-button (click)="openPlanDialog(plan)">Modifier</button>
                      <button mat-button color="warn" (click)="deletePlan(plan.id)">Supprimer</button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="planColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: planColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Gestion Cours">
            <div class="admin-tab-content">
              <div class="table-actions">
                <button mat-raised-button color="primary" (click)="openCourseDialog()">Ajouter un cours</button>
              </div>
              <div class="table-wrapper">
                <table mat-table [dataSource]="courses" class="full-width">
                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Titre</th>
                    <td mat-cell *matCellDef="let course">{{ course.title }}</td>
                  </ng-container>
                  <ng-container matColumnDef="level">
                    <th mat-header-cell *matHeaderCellDef>Niveau</th>
                    <td mat-cell *matCellDef="let course">{{ course.level }}</td>
                  </ng-container>
                  <ng-container matColumnDef="schedule">
                    <th mat-header-cell *matHeaderCellDef>Horaires</th>
                    <td mat-cell *matCellDef="let course">{{ course.schedule }}</td>
                  </ng-container>
                  <ng-container matColumnDef="capacity">
                    <th mat-header-cell *matHeaderCellDef>Capacite</th>
                    <td mat-cell *matCellDef="let course">{{ course.capacity }}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let course">
                      <button mat-button (click)="openCourseDialog(course)">Modifier</button>
                      <button mat-button color="warn" (click)="deleteCourse(course.id)">Supprimer</button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="courseColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: courseColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Gestion Coachs">
            <div class="admin-tab-content">
              <div class="table-actions">
                <button mat-raised-button color="primary" (click)="openCoachDialog()">Ajouter un coach</button>
              </div>
              <div class="table-wrapper">
                <table mat-table [dataSource]="coaches" class="full-width">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let coach">{{ coach.name }}</td>
                  </ng-container>
                  <ng-container matColumnDef="specialty">
                    <th mat-header-cell *matHeaderCellDef>Specialite</th>
                    <td mat-cell *matCellDef="let coach">{{ coach.specialty }}</td>
                  </ng-container>
                  <ng-container matColumnDef="availability">
                    <th mat-header-cell *matHeaderCellDef>Disponibilite</th>
                    <td mat-cell *matCellDef="let coach">{{ coach.availability }}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let coach">
                      <button mat-button (click)="openCoachDialog(coach)">Modifier</button>
                      <button mat-button color="warn" (click)="deleteCoach(coach.id)">Supprimer</button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="coachColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: coachColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Liste Inscriptions">
            <div class="admin-tab-content">
              <div class="table-wrapper">
                <table mat-table [dataSource]="enrollments" class="full-width">
                  <ng-container matColumnDef="confirmationNumber">
                    <th mat-header-cell *matHeaderCellDef>Confirmation</th>
                    <td mat-cell *matCellDef="let enrollment">{{ enrollment.confirmationNumber }}</td>
                  </ng-container>
                  <ng-container matColumnDef="fullName">
                    <th mat-header-cell *matHeaderCellDef>Membre</th>
                    <td mat-cell *matCellDef="let enrollment">{{ enrollment.fullName }}</td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let enrollment">{{ enrollment.email }}</td>
                  </ng-container>
                  <ng-container matColumnDef="plan">
                    <th mat-header-cell *matHeaderCellDef>Plan</th>
                    <td mat-cell *matCellDef="let enrollment">{{ enrollment.plan.name }}</td>
                  </ng-container>
                  <ng-container matColumnDef="coach">
                    <th mat-header-cell *matHeaderCellDef>Coach</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <ng-container *ngIf="enrollment.coaches && enrollment.coaches.length > 0; else noCoach">
                        {{ getCoachNames(enrollment) }}
                      </ng-container>
                      <ng-template #noCoach>Aucun</ng-template>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="courses">
                    <th mat-header-cell *matHeaderCellDef>Cours</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <mat-chip-set class="chip-row">
                        <mat-chip *ngFor="let course of enrollment.courses; trackBy: trackByCourseId">{{ course.title }}</mat-chip>
                      </mat-chip-set>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let enrollment">{{ enrollment.createdAt | date:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <button mat-button color="primary" (click)="openEnrollmentDetail(enrollment)">Details</button>
                      <button mat-button color="warn" (click)="deleteEnrollment(enrollment.id)">Supprimer</button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="enrollmentColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: enrollmentColumns;"></tr>
                </table>
              </div>
              <div *ngIf="enrollments.length === 0" class="empty-state" style="margin-top: 16px;">Aucune inscription enregistree.</div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </section>
  `,
  styles: [`
    .admin-header,
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .table-actions {
      margin-bottom: 16px;
    }

    @media (max-width: 900px) {
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class AdminDashboardPageComponent implements OnInit {
  readonly planColumns = ['name', 'price', 'popular', 'actions'];
  readonly courseColumns = ['title', 'level', 'schedule', 'capacity', 'actions'];
  readonly coachColumns = ['name', 'specialty', 'availability', 'actions'];
  readonly enrollmentColumns = ['confirmationNumber', 'fullName', 'email', 'plan', 'coach', 'courses', 'createdAt', 'actions'];

  plans: Plan[] = [];
  courses: Course[] = [];
  coaches: Coach[] = [];
  enrollments: Enrollment[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly adminAuthService: AdminAuthService,
    private readonly planService: PlanService,
    private readonly courseService: CourseService,
    private readonly coachService: CoachService,
    private readonly enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.syncData();
    this.planService.plans$.subscribe((plans) => (this.plans = plans));
    this.courseService.courses$.subscribe((courses) => (this.courses = courses));
    this.coachService.coaches$.subscribe((coaches) => (this.coaches = coaches));
    this.enrollmentService.enrollments$.subscribe((enrollments) => (this.enrollments = enrollments));
  }

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  openPlanDialog(plan?: Plan): void {
    this.dialog.open(PlanDialogComponent, { width: '640px', data: { plan } }).afterClosed().subscribe((result?: Plan) => {
      if (!result) {
        return;
      }

      if (plan) {
        this.planService.update(result);
        return;
      }

      this.planService.create(result);
    });
  }

  openCourseDialog(course?: Course): void {
    this.dialog.open(CourseDialogComponent, { width: '640px', data: { course } }).afterClosed().subscribe((result?: Course) => {
      if (!result) {
        return;
      }

      if (course) {
        this.courseService.update(result);
        return;
      }

      this.courseService.create(result);
    });
  }

  openCoachDialog(coach?: Coach): void {
    this.dialog.open(CoachDialogComponent, { width: '640px', data: { coach } }).afterClosed().subscribe((result?: Coach) => {
      if (!result) {
        return;
      }

      if (coach) {
        this.coachService.update(result);
        return;
      }

      this.coachService.create(result);
    });
  }

  openEnrollmentDetail(enrollment: Enrollment): void {
    this.dialog
      .open(EnrollmentDetailDialogComponent, { width: '640px', data: { ...enrollment } })
      .afterClosed()
      .subscribe((result?: Enrollment) => {
        if (!result) return;
        this.enrollmentService.update(result);
      });
  }

  deletePlan(id: string): void {
    this.planService.delete(id);
  }

  deleteCourse(id: string): void {
    this.courseService.delete(id);
  }

  deleteCoach(id: string): void {
    this.coachService.delete(id);
  }

  deleteEnrollment(id: string): void {
    this.enrollmentService.delete(id);
  }

  getCoachNames(enrollment: Enrollment): string {
    return enrollment.coaches.map((coach) => coach.name).join(', ');
  }

  trackByCourseId(_index: number, course: Course): string {
    return course.id;
  }

  private syncData(): void {
    this.plans = this.planService.getAll();
    this.courses = this.courseService.getAll();
    this.coaches = this.coachService.getAll();
    this.enrollments = this.enrollmentService.getAll();
  }
}
