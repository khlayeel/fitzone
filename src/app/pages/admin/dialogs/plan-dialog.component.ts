import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Plan } from '../../../core/models/plan.model';

interface PlanDialogData {
  plan?: Plan;
}

@Component({
  selector: 'app-plan-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.plan ? 'Modifier le plan' : 'Ajouter un plan' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Prix</mat-label>
          <input matInput type="number" formControlName="price" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Features separees par virgule</mat-label>
          <input matInput formControlName="features" />
        </mat-form-field>
      </form>
      <mat-checkbox [formControl]="form.controls.popular">Plan populaire</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="save()">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class PlanDialogComponent {
  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.plan?.name ?? '', [Validators.required, Validators.minLength(2)]],
    price: [this.data.plan?.price ?? 0, [Validators.required, Validators.min(1)]],
    description: [this.data.plan?.description ?? '', [Validators.required, Validators.minLength(5)]],
    features: [(this.data.plan?.features ?? []).join(', '), [Validators.required]],
    popular: [this.data.plan?.popular ?? false]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<PlanDialogComponent, Plan>,
    @Inject(MAT_DIALOG_DATA) readonly data: PlanDialogData
  ) {}

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      id: this.data.plan?.id ?? crypto.randomUUID(),
      name: value.name,
      price: Number(value.price),
      description: value.description,
      features: value.features.split(',').map((item) => item.trim()).filter(Boolean),
      popular: value.popular,
      maxCoaches: this.data.plan?.maxCoaches ?? 0,
      maxCourses: this.data.plan?.maxCourses ?? 999,
      restrictions: this.data.plan?.restrictions ?? ''
    });
  }
}
