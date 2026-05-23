import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { Enrollment } from '../../../core/models/enrollment.model';

@Component({
  selector: 'app-enrollment-detail-dialog',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatChipsModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Detail inscription</h2>
    <mat-dialog-content>
      <p><strong>Confirmation:</strong> {{ data.confirmationNumber }}</p>
      <p><strong>Membre:</strong> {{ data.fullName }}</p>
      <p><strong>Telephone:</strong> {{ data.phone }}</p>
      <p><strong>Email:</strong> {{ data.email }}</p>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Mot de passe</mat-label>
        <input matInput [(ngModel)]="data.password" />
      </mat-form-field>
      <p><strong>Plan:</strong> {{ data.plan.name }} - {{ data.plan.price }} DT</p>
      <p><strong>Coachs:</strong></p>
      @if (data.coaches.length > 0) {
        <div class="chip-row">
          @for (coach of data.coaches; track coach.id) {
            <mat-chip>{{ coach.name }} - {{ coach.specialty }}</mat-chip>
          }
        </div>
      } @else {
        <p>Aucun coach pour ce plan.</p>
      }
      <p><strong>Date:</strong> {{ data.createdAt | date:'medium' }}</p>
      <div class="chip-row">
        @for (course of data.courses; track course.id) {
          <mat-chip>{{ course.title }}</mat-chip>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class EnrollmentDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: Enrollment) {}
}
