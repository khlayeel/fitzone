import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Coach } from '../../../core/models/coach.model';

interface CoachDialogData {
  coach?: Coach;
}

@Component({
  selector: 'app-coach-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.coach ? 'Modifier le coach' : 'Ajouter un coach' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Specialite</mat-label>
          <input matInput formControlName="specialty" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Disponibilite</mat-label>
          <input matInput formControlName="availability" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Photo URL</mat-label>
          <input matInput formControlName="photoUrl" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Bio</mat-label>
          <input matInput formControlName="bio" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="save()">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class CoachDialogComponent {
  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.coach?.name ?? '', [Validators.required, Validators.minLength(2)]],
    specialty: [this.data.coach?.specialty ?? '', [Validators.required, Validators.minLength(2)]],
    availability: [this.data.coach?.availability ?? '', [Validators.required]],
    photoUrl: [this.data.coach?.photoUrl ?? '/assets/images/coach-placeholder.svg', [Validators.required]],
    bio: [this.data.coach?.bio ?? '', [Validators.required, Validators.minLength(5)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<CoachDialogComponent, Coach>,
    @Inject(MAT_DIALOG_DATA) readonly data: CoachDialogData
  ) {}

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close({
      id: this.data.coach?.id ?? crypto.randomUUID(),
      ...this.form.getRawValue()
    });
  }
}
