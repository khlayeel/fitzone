import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Plan } from '../models/plan.model';
import { DEFAULT_PLANS } from '../utils/mock-data';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly plansSubject = new BehaviorSubject<Plan[]>([]);
  readonly plans$ = this.plansSubject.asObservable();

  constructor(private readonly storageService: StorageService) {
    const plans = this.storageService.getItem<Plan[]>(STORAGE_KEYS.plans, []);
    if (plans.length === 0) {
      this.storageService.setItem(STORAGE_KEYS.plans, DEFAULT_PLANS);
      this.plansSubject.next(DEFAULT_PLANS);
      return;
    }

    const normalizedPlans = this.normalizeDefaultPlanLimits(plans);
    this.storageService.setItem(STORAGE_KEYS.plans, normalizedPlans);
    this.plansSubject.next(normalizedPlans);
  }

  getAll(): Plan[] {
    return this.plansSubject.value;
  }

  getById(id: string): Plan | undefined {
    return this.getAll().find((plan) => plan.id === id);
  }

  create(plan: Plan): void {
    this.persist([...this.getAll(), plan]);
  }

  update(updatedPlan: Plan): void {
    this.persist(this.getAll().map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)));
  }

  delete(id: string): void {
    this.persist(this.getAll().filter((plan) => plan.id !== id));
  }

  private persist(plans: Plan[]): void {
    this.storageService.setItem(STORAGE_KEYS.plans, plans);
    this.plansSubject.next(plans);
  }

  private normalizeDefaultPlanLimits(plans: Plan[]): Plan[] {
    return plans.map((plan) => {
      if (plan.id === 'plan-basic') {
        return {
          ...plan,
          maxCoaches: 0,
          maxCourses: 4,
          restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. Basic inclut 4 cours par mois et aucun coach personnel.'
        };
      }

      if (plan.id === 'plan-premium') {
        return {
          ...plan,
          maxCoaches: 2,
          maxCourses: 999,
          restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. Premium inclut des cours illimités et jusqu à 2 coachs.'
        };
      }

      if (plan.id === 'plan-vip') {
        return {
          ...plan,
          maxCoaches: 999,
          maxCourses: 999,
          restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. VIP offre un accès illimité aux coachs et aux cours.'
        };
      }

      return plan;
    });
  }
}
