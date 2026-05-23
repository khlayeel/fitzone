import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Coach } from '../models/coach.model';
import { Course } from '../models/course.model';
import { Enrollment } from '../models/enrollment.model';
import { Plan } from '../models/plan.model';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { DEFAULT_ENROLLMENTS } from '../utils/mock-data';
import { MemberActivityService } from './member-activity.service';
import { MemberAuthService } from './member-auth.service';
import { StorageService } from './storage.service';

type EnrollmentPayload = Omit<Enrollment, 'id' | 'confirmationNumber' | 'createdAt'>;
type PendingSelection = {
  coaches?: Array<{ id: string }>;
  courses?: Array<{ id: string }>;
};
const MAX_MEMBERS_PER_COACH = 15;
const MAX_MEMBERS_PER_COURSE = 25;

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  readonly enrollments$ = this.enrollmentsSubject.asObservable();

  constructor(
    private readonly storageService: StorageService,
    private readonly memberActivityService: MemberActivityService,
    private readonly memberAuthService: MemberAuthService
  ) {
    let enrollments = this.storageService.getItem<Enrollment[]>(STORAGE_KEYS.enrollments, []);
    if (enrollments.length === 0) {
      enrollments = DEFAULT_ENROLLMENTS;
      this.storageService.setItem(STORAGE_KEYS.enrollments, enrollments);
    }

    // Normalize stored enrollments: ensure password is present (pull from members if possible)
    enrollments = this.normalizeEnrollments(enrollments);

    // Remove redundant enrollments: keep the most recent entry for identical selections
    const deduped = this.dedupeEnrollments(enrollments);
    if (deduped.length !== enrollments.length) {
      enrollments = deduped;
      this.storageService.setItem(STORAGE_KEYS.enrollments, enrollments);
    }

    this.enrollmentsSubject.next(enrollments);
  }

  /**
   * Remove duplicate enrollments that share the same email, plan, coach set and course set.
   * Keeps the most recent enrollment (by createdAt) for each unique selection key.
   */
  private dedupeEnrollments(enrollments: Enrollment[]): Enrollment[] {
    const map = new Map<string, Enrollment>();

    for (const e of enrollments) {
      const coachIds = (e.coaches && e.coaches.length)
        ? e.coaches.map((c) => c.id).sort().join('|')
        : e.coach
          ? e.coach.id
          : '';

      const courseIds = (e.courses && e.courses.length)
        ? e.courses.map((c) => c.id).sort().join('|')
        : '';

      const key = `${e.email}::${e.plan?.id ?? ''}::${coachIds}::${courseIds}`;

      const existing = map.get(key);
      const eTime = e.createdAt ? Date.parse(e.createdAt) : 0;
      const exTime = existing && existing.createdAt ? Date.parse(existing.createdAt) : 0;

      // keep the most recent enrollment for the same key
      if (!existing || eTime > exTime) {
        map.set(key, e);
      }
    }

    // Return sorted by createdAt desc for convenience
    return Array.from(map.values()).sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
  }

  /**
   * Public helper to remove duplicates and persist the cleaned list.
   * Can be invoked from admin tooling if needed.
   */
  removeDuplicateEnrollments(): void {
    const current = this.getAll();
    const deduped = this.dedupeEnrollments(current);
    if (deduped.length !== current.length) {
      this.persist(deduped);
    }
  }

  delete(id: string): void {
    const remaining = this.getAll().filter((enrollment) => enrollment.id !== id);
    if (remaining.length === this.getAll().length) {
      return;
    }

    this.persist(remaining);
  }

  getAll(): Enrollment[] {
    return this.enrollmentsSubject.value;
  }

  getById(id: string): Enrollment | undefined {
    return this.getAll().find((enrollment) => enrollment.id === id);
  }

  create(payload: EnrollmentPayload): Enrollment {
    const validationError = this.validateSelection(payload.plan, payload.coaches, payload.courses, payload.email);
    if (validationError) {
      throw new Error(validationError);
    }

    const now = new Date();
    const id = crypto.randomUUID();
    const datePart = [
      now.getFullYear(),
      `${now.getMonth() + 1}`.padStart(2, '0'),
      `${now.getDate()}`.padStart(2, '0')
    ].join('');
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    const enrollment: Enrollment = {
      ...payload,
      id,
      confirmationNumber: `FZ-${datePart}-${randomPart}`,
      createdAt: now.toISOString()
    };

    this.persist([enrollment, ...this.getAll()]);
    this.memberActivityService.log(
      'Inscription validée',
      `${payload.plan.name} · ${payload.coaches.length} coach(s) · ${payload.courses.length} cours`
    );
    return enrollment;
  }

  validateSelection(plan: Plan, coaches: Coach[], courses: Course[], memberEmail: string): string | null {
    if (courses.length === 0) {
      return 'Selectionne au moins un cours.';
    }

    if (coaches.length > plan.maxCoaches) {
      return `Ce plan autorise au maximum ${plan.maxCoaches} coach(s).`;
    }

    if (plan.maxCoaches > 0 && coaches.length === 0) {
      return 'Ce plan exige au moins un coach.';
    }

    if (plan.maxCoaches === 0 && coaches.length > 0) {
      return 'Le plan Basic ne donne pas acces aux coachs.';
    }

    if (courses.length > plan.maxCourses) {
      return `Ce plan autorise au maximum ${plan.maxCourses} cours.`;
    }

    const coachAtCapacity = coaches.find((coach) => this.isCoachAtCapacity(coach.id, memberEmail));
    if (coachAtCapacity) {
      return `${coachAtCapacity.name} est complet (15 membres maximum).`;
    }

    const courseAtCapacity = courses.find((course) => this.isCourseAtCapacity(course.id, memberEmail));
    if (courseAtCapacity) {
      return `${courseAtCapacity.title} est complet (25 membres maximum).`;
    }

    return null;
  }

  isCoachAtCapacity(coachId: string, memberEmail?: string): boolean {
    const memberSet = this.getCoachMemberSet(coachId);

    if (memberEmail && memberSet.has(memberEmail)) {
      return false;
    }

    return memberSet.size >= MAX_MEMBERS_PER_COACH;
  }

  isCourseAtCapacity(courseId: string, memberEmail?: string): boolean {
    const memberSet = this.getCourseMemberSet(courseId);

    if (memberEmail && memberSet.has(memberEmail)) {
      return false;
    }

    return memberSet.size >= MAX_MEMBERS_PER_COURSE;
  }

  getCoachMemberCount(coachId: string): number {
    return this.getCoachMemberSet(coachId).size;
  }

  getCourseMemberCount(courseId: string): number {
    return this.getCourseMemberSet(courseId).size;
  }

  getCoachRemainingSlots(coachId: string): number {
    return Math.max(0, MAX_MEMBERS_PER_COACH - this.getCoachMemberCount(coachId));
  }

  getCourseRemainingSlots(courseId: string): number {
    return Math.max(0, MAX_MEMBERS_PER_COURSE - this.getCourseMemberCount(courseId));
  }

  getMaxMembersPerCoach(): number {
    return MAX_MEMBERS_PER_COACH;
  }

  getMaxMembersPerCourse(): number {
    return MAX_MEMBERS_PER_COURSE;
  }

  private normalizeEnrollments(enrollments: Enrollment[]): Enrollment[] {
    const members = this.storageService.getItem<any[]>(STORAGE_KEYS.members, []);
    return enrollments.map((e) => {
      const coaches = this.getEnrollmentCoaches(e);
      if ((e as any).password) {
        return {
          ...e,
          coaches,
          coach: coaches[0] ?? null
        };
      }

      const member = members.find((m) => m.email === e.email);
      if (member && member.password) {
        return {
          ...e,
          password: member.password,
          coaches,
          coach: coaches[0] ?? null
        } as Enrollment;
      }

      return {
        ...e,
        password: '',
        coaches,
        coach: coaches[0] ?? null
      } as Enrollment;
    });
  }

  private getEnrollmentCoaches(enrollment: Enrollment): Coach[] {
    const source = enrollment.coaches?.length
      ? enrollment.coaches
      : enrollment.coach
        ? [enrollment.coach]
        : [];

    return source.filter(
      (coach, index, coaches) => coaches.findIndex((item) => item.id === coach.id) === index
    );
  }

  private getCoachMemberSet(coachId: string): Set<string> {
    const memberSet = this.getPendingCoachMemberSet(coachId);
    for (const enrollment of this.getAll()) {
      const coaches = this.getEnrollmentCoaches(enrollment);
      if (coaches.some((coach) => coach.id === coachId)) {
        memberSet.add(enrollment.email);
      }
    }
    return memberSet;
  }

  private getCourseMemberSet(courseId: string): Set<string> {
    const memberSet = this.getPendingCourseMemberSet(courseId);
    for (const enrollment of this.getAll()) {
      if (enrollment.courses.some((course) => course.id === courseId)) {
        memberSet.add(enrollment.email);
      }
    }
    return memberSet;
  }

  private getPendingCoachMemberSet(coachId: string): Set<string> {
    return this.getPendingMemberSet((selection) =>
      (selection.coaches ?? []).some((coach) => coach.id === coachId)
    );
  }

  private getPendingCourseMemberSet(courseId: string): Set<string> {
    return this.getPendingMemberSet((selection) =>
      (selection.courses ?? []).some((course) => course.id === courseId)
    );
  }

  private getPendingMemberSet(matcher: (selection: PendingSelection) => boolean): Set<string> {
    const members = new Set<string>();

    if (typeof localStorage === 'undefined') {
      return members;
    }

    const keyPrefix = `${STORAGE_KEYS.selection}_`;
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(keyPrefix)) {
        continue;
      }

      const email = key.slice(keyPrefix.length);
      if (!email) {
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      try {
        const selection = JSON.parse(raw) as PendingSelection;
        if (matcher(selection)) {
          members.add(email);
        }
      } catch {
        // Ignore malformed pending selection entries.
      }
    }

    return members;
  }

  private persist(enrollments: Enrollment[]): void {
    this.storageService.setItem(STORAGE_KEYS.enrollments, enrollments);
    this.enrollmentsSubject.next(enrollments);
  }

  update(enrollment: Enrollment): void {
    const list = this.getAll().map((e) => (e.id === enrollment.id ? enrollment : e));
    this.persist(list);
    this.memberAuthService.syncFromEnrollment({
      fullName: enrollment.fullName,
      phone: enrollment.phone,
      email: enrollment.email,
      password: enrollment.password,
      createdAt: enrollment.createdAt
    });
  }
}
