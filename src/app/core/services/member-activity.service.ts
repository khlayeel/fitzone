import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MemberActivity } from '../models/member.model';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';
import { MemberAuthService } from './member-auth.service';

@Injectable({ providedIn: 'root' })
export class MemberActivityService {
  private readonly activitiesSubject = new BehaviorSubject<MemberActivity[]>([]);
  readonly activities$ = this.activitiesSubject.asObservable();

  constructor(
    private readonly storageService: StorageService,
    private readonly memberAuthService: MemberAuthService
  ) {
    const activities = this.storageService.getItem<MemberActivity[]>(STORAGE_KEYS.memberActivities, []);
    this.activitiesSubject.next(activities);
  }

  log(action: string, details: string): void {
    const member = this.memberAuthService.currentMember;
    if (!member) {
      return;
    }

    const activity: MemberActivity = {
      id: crypto.randomUUID(),
      memberEmail: member.email,
      memberName: member.fullName,
      action,
      details,
      createdAt: new Date().toISOString()
    };

    this.persist([activity, ...this.activitiesSubject.value]);
  }

  getForMember(email: string): MemberActivity[] {
    return this.activitiesSubject.value.filter((activity) => activity.memberEmail === email);
  }

  private persist(activities: MemberActivity[]): void {
    this.activitiesSubject.next(activities);
    this.storageService.setItem(STORAGE_KEYS.memberActivities, activities);
  }
}