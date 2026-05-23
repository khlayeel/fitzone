import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Course, CourseLevel } from '../../../core/models/course.model';

interface CourseDialogData {
  course?: Course;
}

@Component({
  selector: 'app-course-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.course ? 'Modifier le cours' : 'Ajouter un cours' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Niveau</mat-label>
          <mat-select formControlName="level">
            <mat-option value="Débutant">Débutant</mat-option>
            <mat-option value="Intermédiaire">Intermédiaire</mat-option>
            <mat-option value="Avancé">Avancé</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Duree</mat-label>
          <input matInput formControlName="duration" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Horaires</mat-label>
          <input matInput formControlName="schedule" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Capacite</mat-label>
          <input matInput type="number" formControlName="capacity" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="save()">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class CourseDialogComponent {
  readonly form = this.formBuilder.nonNullable.group({
    title: [this.data.course?.title ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.course?.description ?? '', [Validators.required, Validators.minLength(5)]],
    level: [this.data.course?.level ?? 'Débutant' as CourseLevel, [Validators.required]],
    duration: [this.data.course?.duration ?? '', [Validators.required]],
    schedule: [this.data.course?.schedule ?? '', [Validators.required]],
    capacity: [this.data.course?.capacity ?? 10, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<CourseDialogComponent, Course>,
    @Inject(MAT_DIALOG_DATA) readonly data: CourseDialogData
  ) {}

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      id: this.data.course?.id ?? crypto.randomUUID(),
      title: value.title,
      description: value.description,
      level: value.level,
      duration: value.duration,
      schedule: value.schedule,
      capacity: Number(value.capacity)
    });
  }
}
