import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { startWith } from 'rxjs';

import { Course } from '../../core/models/course.model';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { SelectionStoreService } from '../../core/services/selection-store.service';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <h1 class="section-title">Cours</h1>
        <p class="section-subtitle">Filtre les sessions, puis ajoute tes cours à ta sélection.</p>

        @if (currentPlan && coachCountLabel) {
          <div class="info-label">
            <strong>Cours sélectionnés :</strong> {{ coachCountLabel }}
          </div>
        }

        <div class="content-panel filters">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Recherche</mat-label>
              <input matInput [formControl]="searchControl" placeholder="HIIT, Yoga, Boxe..." />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Niveau</mat-label>
              <mat-select [formControl]="levelControl">
                <mat-option value="">Tous</mat-option>
                <mat-option value="Débutant">Débutant</mat-option>
                <mat-option value="Intermédiaire">Intermédiaire</mat-option>
                <mat-option value="Avancé">Avancé</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="grid grid-3 cards-zone">
          @for (course of filteredCourses; track course.id) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ course.title }}</mat-card-title>
                <mat-card-subtitle>{{ course.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="chip-row">
                  <mat-chip>{{ course.level }}</mat-chip>
                  <mat-chip>{{ course.duration }}</mat-chip>
                  <mat-chip>{{ course.schedule }}</mat-chip>
                  <mat-chip>Capacite interne {{ course.capacity }}</mat-chip>
                </div>
                <p class="capacity-label" [class.capacity-full]="getCourseRemainingSlots(course) === 0">
                  Places: {{ getCourseMemberCount(course) }}/{{ maxMembersPerCourse }}
                  (reste {{ getCourseRemainingSlots(course) }})
                </p>
              </mat-card-content>
              <mat-card-actions>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="addCourse(course)"
                  [disabled]="isCourseButtonDisabled(course)">
                  Ajouter
                </button>
              </mat-card-actions>
            </mat-card>
          } @empty {
            <div class="empty-state">Aucun cours ne correspond aux filtres actuels.</div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .filters {
      padding: 20px;
      margin-bottom: 24px;
    }

    .cards-zone {
      margin-top: 24px;
    }

    .info-label {
      background-color: var(--fz-surface-secondary);
      border-left: 3px solid var(--fz-primary-strong);
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
      font-size: 0.95rem;
    }

    .capacity-label {
      margin-top: 10px;
      font-weight: 600;
      color: var(--fz-muted);
    }

    .capacity-full {
      color: #ff8a80;
    }
  `]
})
export class CoursesPageComponent implements OnInit {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly levelControl = new FormControl('');

  private courses: Course[] = [];
  filteredCourses: Course[] = [];
  currentPlan = this.selectionStoreService.snapshot.plan;
  coachCountLabel = '';
  readonly maxMembersPerCourse: number;

  constructor(
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly selectionStoreService: SelectionStoreService,
    private readonly snackBar: MatSnackBar
  ) {
    this.maxMembersPerCourse = this.enrollmentService.getMaxMembersPerCourse();
  }

  ngOnInit(): void {
    this.courses = this.courseService.getAll();
    this.filteredCourses = this.courses;

    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)).subscribe(() => this.applyFilters());
    this.levelControl.valueChanges.pipe(startWith(this.levelControl.value)).subscribe(() => this.applyFilters());

    this.courseService.courses$.subscribe((courses) => {
      this.courses = courses;
      this.applyFilters();
    });

    this.selectionStoreService.selection$.subscribe((selection) => {
      this.currentPlan = selection.plan;
      this.updateCourseCountLabel();
    });

    this.enrollmentService.enrollments$.subscribe(() => {
      this.filteredCourses = [...this.filteredCourses];
    });
  }

  addCourse(course: Course): void {
    if (!this.currentPlan) {
      this.snackBar.open('Choisis d abord un plan.', 'Fermer', { duration: 2500 });
      return;
    }

    if (this.selectionStoreService.snapshot.courses.some((item) => item.id === course.id)) {
      this.snackBar.open(`${course.title} est deja dans la selection`, 'Fermer', { duration: 2500 });
      return;
    }

    if (this.selectionStoreService.snapshot.courses.length >= this.currentPlan.maxCourses) {
      this.snackBar.open(`Nombre maximum de cours atteint (${this.currentPlan.maxCourses})`, 'Fermer', { duration: 2500 });
      return;
    }

    if (!this.selectionStoreService.canAddCourse(course)) {
      this.snackBar.open(`${course.title} est complet (25 membres maximum).`, 'Fermer', { duration: 2500 });
      return;
    }

    const added = this.selectionStoreService.addCourse(course);
    const message = added
      ? `${course.title} ajoute dans la selection`
      : `${course.title} est deja dans la selection`;

    this.snackBar.open(message, 'Fermer', { duration: 2500 });
  }

  isCourseButtonDisabled(course: Course): boolean {
    if (!this.currentPlan) return true;
    if (this.selectionStoreService.snapshot.courses.some((item) => item.id === course.id)) return true;
    if (this.selectionStoreService.snapshot.courses.length >= this.currentPlan.maxCourses) return true;
    return !this.selectionStoreService.canAddCourse(course);
  }

  getCourseMemberCount(course: Course): number {
    return this.enrollmentService.getCourseMemberCount(course.id);
  }

  getCourseRemainingSlots(course: Course): number {
    return this.enrollmentService.getCourseRemainingSlots(course.id);
  }

  private updateCourseCountLabel(): void {
    if (!this.currentPlan) {
      this.coachCountLabel = '';
      return;
    }
    const count = this.selectionStoreService.snapshot.courses.length;
    const max = this.currentPlan.maxCourses;
    this.coachCountLabel = max >= 999 ? `${count}/Illimite` : `${count}/${max}`;
  }

  private applyFilters(): void {
    const search = this.searchControl.value.trim().toLowerCase();
    const level = this.levelControl.value;

    this.filteredCourses = this.courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search) ||
        course.schedule.toLowerCase().includes(search);

      const matchesLevel = !level || course.level === level;
      return matchesSearch && matchesLevel;
    });
  }
}
