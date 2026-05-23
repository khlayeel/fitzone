import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Plan } from '../../core/models/plan.model';
import { PlanService } from '../../core/services/plan.service';
import { SelectionStoreService } from '../../core/services/selection-store.service';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [MatBadgeModule, MatButtonModule, MatCardModule, MatChipsModule, MatSnackBarModule],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <h1 class="section-title">💳 Plans & Tarifs</h1>
        <p class="section-subtitle">Trois plans flexibles adaptés à ton niveau et tes objectifs.</p>

        <div class="plan-guidance">
          <strong>Cadre de sécurité FitZone:</strong> 15 membres maximum par coach et 25 membres maximum par cours. 
          Cela garantit une qualité d'entraînement et un coaching personnalisé.
        </div>

        <div class="grid grid-3">
          @for (plan of plans; track plan.id) {
            <mat-card class="plan-card" [class.plan-popular]="plan.popular">
              @if (plan.popular) {
                <div class="popular-badge">⭐ POPULAIRE</div>
              }
              <mat-card-header>
                <mat-card-title class="plan-name">{{ plan.name }}</mat-card-title>
                <mat-card-subtitle class="plan-desc">{{ plan.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="price-section">
                  <span class="price">{{ plan.price }}</span>
                  <span class="currency">DT/mois</span>
                </div>
                
                <div class="plan-limits">
                  <div class="limit-item">
                    <img class="limit-icon" src="assets/images/personnes-dans-la-salle-de-gym.jpg" alt="Courses" />
                    <div>
                      <span class="limit-label">Cours</span>
                      <span class="limit-value">{{ formatLimit(plan.maxCourses) }}</span>
                    </div>
                  </div>
                  <div class="limit-item">
                    <img class="limit-icon" src="assets/images/entaineur-sportif-personnel-coach.jpeg" alt="Coachs" />
                    <div>
                      <span class="limit-label">Coachs</span>
                      <span class="limit-value">{{ formatLimit(plan.maxCoaches) }}</span>
                    </div>
                  </div>
                </div>

                <div class="features-list">
                  @for (feature of plan.features; track feature) {
                    <div class="feature-item">
                      <span class="check-icon">✓</span>
                      <span>{{ feature }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button 
                  mat-raised-button 
                  [color]="plan.popular ? 'primary' : ''" 
                  [class.primary-btn]="plan.popular"
                  [class.secondary-btn]="!plan.popular"
                  (click)="selectPlan(plan)">
                  Choisir ce plan
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .price-section {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--fz-border);
    }

    .price {
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--fz-primary);
    }

    .currency {
      font-size: 0.9rem;
      color: var(--fz-muted);
      font-weight: 600;
      text-transform: uppercase;
    }

    .plan-guidance {
      margin: 0 0 32px;
      padding: 20px 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 61, 84, 0.08), rgba(0, 212, 255, 0.05));
      border: 1px solid var(--fz-border);
      color: var(--fz-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .plan-guidance strong {
      color: var(--fz-text);
    }

    .plan-card {
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .plan-card:hover {
      transform: translateY(-12px);
      border-color: rgba(255, 61, 84, 0.3);
      box-shadow: 0 24px 60px rgba(255, 61, 84, 0.2);
    }

    .plan-card.plan-popular {
      border-color: rgba(255, 61, 84, 0.4);
      background: linear-gradient(135deg, rgba(255, 61, 84, 0.12) 0%, rgba(0, 212, 255, 0.05) 100%);
      box-shadow: 0 12px 40px rgba(255, 61, 84, 0.15);
    }

    .popular-badge {
      position: absolute;
      top: 16px;
      right: -30px;
      transform: rotate(45deg);
      width: 120px;
      padding: 8px;
      text-align: center;
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-primary-strong));
      color: white;
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 16px rgba(255, 61, 84, 0.3);
    }

    .plan-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--fz-text);
    }

    .plan-desc {
      font-size: 0.95rem;
      color: var(--fz-muted);
      margin-top: 8px;
    }

    .plan-limits {
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }

    .limit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      border: 1px solid var(--fz-border);
    }

    .limit-icon {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
      flex: 0 0 auto;
    }

    .limit-label {
      display: block;
      font-size: 0.8rem;
      color: var(--fz-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .limit-value {
      display: block;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--fz-primary);
    }

    .features-list {
      display: grid;
      gap: 10px;
      margin-bottom: 24px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.95rem;
      color: var(--fz-muted);
      line-height: 1.5;
    }

    .check-icon {
      color: var(--fz-success);
      font-weight: 700;
      flex: 0 0 auto;
      margin-top: 2px;
    }

    mat-card-actions {
      display: flex;
      justify-content: center;
      padding: 24px 16px 16px;
    }

    .primary-btn {
      background: linear-gradient(135deg, var(--fz-primary), var(--fz-primary-strong));
      box-shadow: 0 8px 24px rgba(255, 61, 84, 0.35);
      width: 100%;
      max-width: 280px;
    }

    .secondary-btn {
      border: 2px solid var(--fz-accent);
      color: var(--fz-accent);
      width: 100%;
      max-width: 280px;
    }

    .secondary-btn:hover {
      background: rgba(0, 212, 255, 0.1);
    }

  `]
})
export class PricingPageComponent implements OnInit {
  plans: Plan[] = [];

  constructor(
    private readonly planService: PlanService,
    private readonly selectionStoreService: SelectionStoreService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.plans = this.planService.getAll();
    this.planService.plans$.subscribe((plans) => (this.plans = plans));
  }

  selectPlan(plan: Plan): void {
    const previousPlan = this.selectionStoreService.snapshot.plan;
    const added = this.selectionStoreService.setPlan(plan);
    const message = added
      ? (previousPlan ? `Plan modifie vers ${plan.name}` : `${plan.name} ajoute dans la selection`)
      : `${plan.name} est deja dans la selection`;

    this.snackBar.open(message, 'Fermer', { duration: 2500 });
  }

  formatLimit(value: number): string {
    return value >= 999 ? 'Illimité' : `${value}`;
  }
}
