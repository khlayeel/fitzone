import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Coach } from '../models/coach.model';
import { DEFAULT_COACHES } from '../utils/mock-data';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CoachService {
  private readonly coachesSubject = new BehaviorSubject<Coach[]>([]);
  readonly coaches$ = this.coachesSubject.asObservable();

  constructor(private readonly storageService: StorageService) {
    const coaches = this.storageService.getItem<Coach[]>(STORAGE_KEYS.coaches, []);
    if (coaches.length === 0) {
      this.storageService.setItem(STORAGE_KEYS.coaches, DEFAULT_COACHES);
      this.coachesSubject.next(DEFAULT_COACHES);
      return;
    }

    this.coachesSubject.next(coaches);
  }

  getAll(): Coach[] {
    return this.coachesSubject.value;
  }

  getById(id: string): Coach | undefined {
    return this.getAll().find((coach) => coach.id === id);
  }

  create(coach: Coach): void {
    this.persist([...this.getAll(), coach]);
  }

  update(updatedCoach: Coach): void {
    this.persist(this.getAll().map((coach) => (coach.id === updatedCoach.id ? updatedCoach : coach)));
  }

  delete(id: string): void {
    this.persist(this.getAll().filter((coach) => coach.id !== id));
  }

  private persist(coaches: Coach[]): void {
    this.storageService.setItem(STORAGE_KEYS.coaches, coaches);
    this.coachesSubject.next(coaches);
  }
}
