import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Coach } from '../../core/models/coach.model';
import { Course } from '../../core/models/course.model';
import { Plan } from '../../core/models/plan.model';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { MemberAuthService } from '../../core/services/member-auth.service';
import { SelectionStoreService } from '../../core/services/selection-store.service';

@Component({
  selector: 'app-enroll-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <h1 class="section-title">Inscription</h1>
        <p class="section-subtitle">Finalise ton dossier membre avec tes choix de plan, coach et cours.</p>

        <div class="grid grid-2">
          <mat-card>
            <mat-card-header><mat-card-title>Informations membre</mat-card-title></mat-card-header>
            <mat-card-content>
              <form [formGroup]="form" class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nom complet</mat-label>
                  <input matInput formControlName="fullName" />
                  @if (form.controls.fullName.invalid && form.controls.fullName.touched) {
                    <mat-error>Nom requis, minimum 3 caracteres.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Telephone</mat-label>
                  <input matInput formControlName="phone" placeholder="12345678" />
                  @if (form.controls.phone.invalid && form.controls.phone.touched) {
                    <mat-error>Numero requis sur 8 chiffres.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" />
                  @if (form.controls.email.invalid && form.controls.email.touched) {
                    <mat-error>Email valide requis.</mat-error>
                  }
                </mat-form-field>
              </form>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header><mat-card-title>Recapitulatif</mat-card-title></mat-card-header>
            <mat-card-content>
              <p><strong>Plan:</strong> {{ selectedPlan?.name ?? 'Non selectionne' }}</p>
              <p><strong>Coachs:</strong></p>
              @if (selectedCoaches.length > 0) {
                <mat-chip-set class="chip-row">
                  @for (coach of selectedCoaches; track coach.id) {
                    <mat-chip>{{ coach.name }}</mat-chip>
                  }
                </mat-chip-set>
              } @else {
                <p class="muted">Aucun coach selectionne.</p>
              }

              <p><strong>Cours:</strong></p>
              @if (selectedCourses.length > 0) {
                <mat-chip-set class="chip-row">
                  @for (course of selectedCourses; track course.id) {
                    <mat-chip (removed)="removeCourse(course.id)">
                      {{ course.title }}
                      <button matChipRemove aria-label="Supprimer">x</button>
                    </mat-chip>
                  }
                </mat-chip-set>
              } @else {
                <p class="muted">Aucun cours selectionne.</p>
              }

              @if (selectionError) {
                <p class="selection-error">{{ selectionError }}</p>
              }
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/pricing">Choisir un plan</a>
              <a mat-button routerLink="/coaches">Choisir un coach</a>
              <a mat-button routerLink="/courses">Ajouter des cours</a>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" (click)="submit()">Valider l inscription</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .selection-error {
      color: #ff8a80;
      font-weight: 600;
      margin-top: 16px;
    }
  `]
})
export class EnrollPageComponent implements OnInit {
  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  selectedPlan: Plan | null = null;
  selectedCoaches: Coach[] = [];
  selectedCourses: Course[] = [];
  selectionError = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly selectionStoreService: SelectionStoreService,
    private readonly enrollmentService: EnrollmentService,
    private readonly memberAuthService: MemberAuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const member = this.memberAuthService.currentMember;
    if (member) {
      this.form.patchValue({
        fullName: member.fullName,
        phone: member.phone,
        email: member.email
      });
    }

    this.selectionStoreService.selection$.subscribe((selection) => {
      this.selectedPlan = selection.plan;
      this.selectedCoaches = selection.coaches;
      this.selectedCourses = selection.courses;
    });
  }

  removeCourse(courseId: string): void {
    this.selectionStoreService.removeCourse(courseId);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.selectionError = '';

    if (!this.selectedPlan) {
      this.selectionError = 'Un plan est obligatoire.';
      return;
    }

    if (this.selectedPlan.maxCoaches > 0 && this.selectedCoaches.length === 0) {
      this.selectionError = 'Ce plan exige au moins un coach.';
      return;
    }

    if (this.selectedPlan.maxCoaches === 0 && this.selectedCoaches.length > 0) {
      this.selectionError = 'Le plan Basic ne donne pas acces aux coachs.';
      return;
    }

    if (this.selectedCourses.length === 0) {
      this.selectionError = 'Selectionne au moins un cours.';
      return;
    }

    if (this.form.invalid) {
      return;
    }

    const validationError = this.enrollmentService.validateSelection(
      this.selectedPlan,
      this.selectedCoaches,
      this.selectedCourses,
      this.form.controls.email.value
    );

    if (validationError) {
      this.selectionError = validationError;
      return;
    }

    const enrollment = this.enrollmentService.create({
      ...this.form.getRawValue(),
      plan: this.selectedPlan,
      coaches: this.selectedCoaches,
      coach: this.selectedCoaches[0] ?? null,
      courses: this.selectedCourses
    });

    this.selectionStoreService.clear();
    this.snackBar.open('Inscription enregistree avec succes', 'Fermer', { duration: 2500 });
    this.router.navigate(['/confirmation', enrollment.id]);
  }
}
