import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Coach } from '../models/coach.model';
import { Course } from '../models/course.model';
import { Plan } from '../models/plan.model';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { EnrollmentService } from './enrollment.service';
import { MemberActivityService } from './member-activity.service';
import { MemberAuthService } from './member-auth.service';
import { StorageService } from './storage.service';

interface SelectionState {
  plan: Plan | null;
  coach: Coach | null;
  coaches: Coach[];
  courses: Course[];
}

const EMPTY_SELECTION: SelectionState = {
  plan: null,
  coach: null,
  coaches: [],
  courses: []
};

@Injectable({ providedIn: 'root' })
export class SelectionStoreService {
  private readonly selectionSubject = new BehaviorSubject<SelectionState>(EMPTY_SELECTION);
  readonly selection$ = this.selectionSubject.asObservable();

  constructor(
    private readonly storageService: StorageService,
    private readonly memberAuthService: MemberAuthService,
    private readonly memberActivityService: MemberActivityService,
    private readonly enrollmentService: EnrollmentService
  ) {
    this.memberAuthService.currentMember$.subscribe((member) => {
      const stored = this.storageService.getItem<SelectionState>(
        this.getSelectionKey(member?.email ?? null),
        EMPTY_SELECTION
      );
      const normalized = this.normalizeSelection(stored);
      this.selectionSubject.next(normalized);
    });
  }

  get snapshot(): SelectionState {
    return this.selectionSubject.value;
  }

  setPlan(plan: Plan): boolean {
    const currentPlan = this.snapshot.plan;
    const isSamePlan = currentPlan?.id === plan.id;
    if (isSamePlan) {
      return false;
    }

    // Keep existing choices where possible, trim those that exceed the new plan limits.
    const nextCoaches = this.snapshot.coaches.slice(0, plan.maxCoaches);
    const nextCourses = this.snapshot.courses.slice(0, plan.maxCourses);

    this.persist({
      ...this.snapshot,
      plan,
      coach: nextCoaches.at(-1) ?? null,
      coaches: nextCoaches,
      courses: nextCourses
    });

    this.memberActivityService.log(currentPlan ? 'Plan modifié' : 'Plan sélectionné', plan.name);
    return true;
  }

  setCoach(coach: Coach): boolean {
    return this.addCoach(coach);
  }

  addCoach(coach: Coach): boolean {
    if (!this.canAddCoach(coach)) {
      return false;
    }

    const exists = this.snapshot.coaches.some((item) => item.id === coach.id);
    if (exists) {
      return false;
    }

    this.persist({
      ...this.snapshot,
      coach,
      coaches: [...this.snapshot.coaches, coach]
    });
    this.memberActivityService.log('Coach sélectionné', coach.name);
    return true;
  }

  addCourse(course: Course): boolean {
    if (!this.canAddCourse(course)) {
      return false;
    }

    const exists = this.snapshot.courses.some((item) => item.id === course.id);
    if (exists) {
      return false;
    }

    this.persist({ ...this.snapshot, courses: [...this.snapshot.courses, course] });
    this.memberActivityService.log('Cours ajouté', course.title);
    return true;
  }

  removeCourse(courseId: string): boolean {
    const removedCourse = this.snapshot.courses.find((course) => course.id === courseId);
    if (!removedCourse) {
      return false;
    }

    this.persist({
      ...this.snapshot,
      courses: this.snapshot.courses.filter((course) => course.id !== courseId)
    });
    this.memberActivityService.log('Cours retiré', removedCourse.title);
    return true;
  }

  clear(): void {
    this.persist(EMPTY_SELECTION);
  }

  canAddCoach(coach: Coach): boolean {
    const plan = this.snapshot.plan;
    if (!plan) {
      return false;
    }

    if (this.snapshot.coaches.some((item) => item.id === coach.id)) {
      return false;
    }

    if (this.snapshot.coaches.length >= plan.maxCoaches) {
      return false;
    }

    return !this.enrollmentService.isCoachAtCapacity(coach.id, this.memberAuthService.currentMember?.email);
  }

  canAddCourse(course: Course): boolean {
    const plan = this.snapshot.plan;
    if (!plan) {
      return false;
    }

    if (this.snapshot.courses.some((item) => item.id === course.id)) {
      return false;
    }

    if (this.snapshot.courses.length >= plan.maxCourses) {
      return false;
    }

    return !this.enrollmentService.isCourseAtCapacity(course.id, this.memberAuthService.currentMember?.email);
  }

  private persist(selection: SelectionState): void {
    const normalized = this.normalizeSelection(selection);
    this.storageService.setItem(this.getSelectionKey(this.memberAuthService.currentMember?.email ?? null), normalized);
    this.selectionSubject.next(normalized);
  }

  private normalizeSelection(raw: SelectionState): SelectionState {
    const coachesSource = raw.coaches?.length
      ? raw.coaches
      : raw.coach
        ? [raw.coach]
        : [];

    const uniqueCoaches = coachesSource.filter(
      (coach, index, coaches) => coaches.findIndex((item) => item.id === coach.id) === index
    );

    const coach = uniqueCoaches.at(-1) ?? null;

    return {
      plan: raw.plan ?? null,
      coach,
      coaches: uniqueCoaches,
      courses: raw.courses ?? []
    };
  }

  private getSelectionKey(email: string | null): string {
    return email ? `${STORAGE_KEYS.selection}_${email}` : STORAGE_KEYS.selection;
  }
}
