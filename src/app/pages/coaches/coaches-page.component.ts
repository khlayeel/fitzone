import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { startWith } from 'rxjs';

import { Coach } from '../../core/models/coach.model';
import { CoachService } from '../../core/services/coach.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { SelectionStoreService } from '../../core/services/selection-store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coaches-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <h1 class="section-title">Coachs</h1>
        <p class="section-subtitle">Choisis le coach qui correspond a ton objectif principal.</p>

        @if (currentPlan && currentPlan.maxCoaches === 0) {
          <div class="warning-info">
            <strong>Votre plan Basic n'inclut pas l'accès aux coachs.</strong> Passez au plan Premium ou VIP pour en ajouter.
          </div>
        } @else if (currentPlan && coachCountLabel) {
          <div class="info-label">
            <strong>Coachs sélectionnés :</strong> {{ coachCountLabel }}
          </div>
        }

        <div class="content-panel filters">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Recherche</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Nom, bio ou disponibilite" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Specialite</mat-label>
              <mat-select [formControl]="specialtyControl">
                <mat-option value="">Toutes</mat-option>
                @for (specialty of specialties; track specialty) {
                  <mat-option [value]="specialty">{{ specialty }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="grid grid-3 cards-zone">
          @for (coach of filteredCoaches; track coach.id) {
            <mat-card>
              <img mat-card-image [src]="coach.photoUrl" [alt]="coach.name" />
              <mat-card-header>
                <mat-card-title>{{ coach.name }}</mat-card-title>
                <mat-card-subtitle>{{ coach.specialty }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{ coach.bio }}</p>
                <p class="muted">{{ coach.availability }}</p>
                <p class="capacity-label" [class.capacity-full]="getCoachRemainingSlots(coach) === 0">
                  Places: {{ getCoachMemberCount(coach) }}/{{ maxMembersPerCoach }}
                  (reste {{ getCoachRemainingSlots(coach) }})
                </p>
              </mat-card-content>
              <mat-card-actions>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="selectCoach(coach)"
                  [disabled]="isCoachButtonDisabled(coach)">
                  Choisir coach
                </button>
              </mat-card-actions>
            </mat-card>
          } @empty {
            <div class="empty-state">Aucun coach ne correspond aux filtres actuels.</div>
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

    img[mat-card-image] {
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }

    .warning-info {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 16px;
      color: #856404;
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
export class CoachesPageComponent implements OnInit {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly specialtyControl = new FormControl('');

  private coaches: Coach[] = [];
  filteredCoaches: Coach[] = [];
  specialties: string[] = [];
  currentPlan = this.selectionStoreService.snapshot.plan;
  coachCountLabel = '';
  readonly maxMembersPerCoach: number;

  constructor(
    private readonly coachService: CoachService,
    private readonly enrollmentService: EnrollmentService,
    private readonly selectionStoreService: SelectionStoreService,
    private readonly snackBar: MatSnackBar
  ) {
    this.maxMembersPerCoach = this.enrollmentService.getMaxMembersPerCoach();
  }

  ngOnInit(): void {
    this.coaches = this.coachService.getAll();
    this.specialties = [...new Set(this.coaches.map((coach) => coach.specialty))];
    this.filteredCoaches = this.coaches;

    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)).subscribe(() => this.applyFilters());
    this.specialtyControl.valueChanges.pipe(startWith(this.specialtyControl.value)).subscribe(() => this.applyFilters());

    this.coachService.coaches$.subscribe((coaches) => {
      this.coaches = coaches;
      this.specialties = [...new Set(coaches.map((coach) => coach.specialty))];
      this.applyFilters();
    });

    this.selectionStoreService.selection$.subscribe((selection) => {
      this.currentPlan = selection.plan;
      this.updateCoachCountLabel();
    });

    this.enrollmentService.enrollments$.subscribe(() => {
      this.filteredCoaches = [...this.filteredCoaches];
    });
  }

  selectCoach(coach: Coach): void {
    if (!this.currentPlan) {
      this.snackBar.open('Choisis d abord un plan.', 'Fermer', { duration: 2500 });
      return;
    }

    if (this.currentPlan.maxCoaches === 0) {
      this.snackBar.open('Le plan Basic ne donne pas acces aux coachs.', 'Fermer', { duration: 2500 });
      return;
    }

    if (this.selectionStoreService.snapshot.coaches.some((item) => item.id === coach.id)) {
      this.snackBar.open(`${coach.name} est deja dans la selection`, 'Fermer', { duration: 2500 });
      return;
    }

    if (this.selectionStoreService.snapshot.coaches.length >= this.currentPlan.maxCoaches) {
      this.snackBar.open(`Nombre maximum de coachs atteint (${this.currentPlan.maxCoaches})`, 'Fermer', { duration: 2500 });
      return;
    }

    if (!this.selectionStoreService.canAddCoach(coach)) {
      this.snackBar.open(`${coach.name} est complet (15 membres maximum).`, 'Fermer', { duration: 2500 });
      return;
    }

    const added = this.selectionStoreService.addCoach(coach);
    const message = added
      ? `${coach.name} ajoute dans la selection`
      : `${coach.name} est deja dans la selection`;

    this.snackBar.open(message, 'Fermer', { duration: 2500 });
  }

  isCoachButtonDisabled(coach: Coach): boolean {
    if (!this.currentPlan) return true;
    if (this.currentPlan.maxCoaches === 0) return true;
    if (this.selectionStoreService.snapshot.coaches.some((item) => item.id === coach.id)) return true;
    if (this.selectionStoreService.snapshot.coaches.length >= this.currentPlan.maxCoaches) return true;
    return !this.selectionStoreService.canAddCoach(coach);
  }

  getCoachMemberCount(coach: Coach): number {
    return this.enrollmentService.getCoachMemberCount(coach.id);
  }

  getCoachRemainingSlots(coach: Coach): number {
    return this.enrollmentService.getCoachRemainingSlots(coach.id);
  }

  private updateCoachCountLabel(): void {
    if (!this.currentPlan) {
      this.coachCountLabel = '';
      return;
    }
    const count = this.selectionStoreService.snapshot.coaches.length;
    const max = this.currentPlan.maxCoaches;
    this.coachCountLabel = max >= 999 ? `${count}/Illimite` : `${count}/${max}`;
  }

  private applyFilters(): void {
    const search = this.searchControl.value.trim().toLowerCase();
    const specialty = this.specialtyControl.value;

    this.filteredCoaches = this.coaches.filter((coach) => {
      const matchesSearch =
        coach.name.toLowerCase().includes(search) ||
        coach.bio.toLowerCase().includes(search) ||
        coach.availability.toLowerCase().includes(search);

      const matchesSpecialty = !specialty || coach.specialty === specialty;
      return matchesSearch && matchesSpecialty;
    });
  }
}
