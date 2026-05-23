import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MemberAccount, MemberLoginPayload, MemberRegistrationPayload } from '../models/member.model';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';

type MemberSyncPayload = Pick<MemberAccount, 'fullName' | 'phone' | 'email' | 'password' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class MemberAuthService {
  private readonly membersSubject = new BehaviorSubject<MemberAccount[]>([]);
  private readonly currentMemberSubject = new BehaviorSubject<MemberAccount | null>(null);

  readonly members$ = this.membersSubject.asObservable();
  readonly currentMember$ = this.currentMemberSubject.asObservable();

  constructor(private readonly storageService: StorageService) {
    const members = this.storageService.getItem<MemberAccount[]>(STORAGE_KEYS.members, []);
    this.membersSubject.next(members);

    const storedEmail = this.storageService.getItem<string | null>(STORAGE_KEYS.memberSession, null);
    if (storedEmail) {
      const member = members.find((item) => item.email === storedEmail) ?? null;
      if (member) {
        this.currentMemberSubject.next(member);
      } else {
        this.storageService.removeItem(STORAGE_KEYS.memberSession);
      }
    }
  }

  get currentMember(): MemberAccount | null {
    return this.currentMemberSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentMemberSubject.value !== null;
  }

  register(payload: MemberRegistrationPayload): boolean {
    const normalizedEmail = this.normalizeEmail(payload.email);
    const alreadyExists = this.membersSubject.value.some((member) => member.email === normalizedEmail);

    if (alreadyExists) {
      return false;
    }

    const member: MemberAccount = {
      id: crypto.randomUUID(),
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      email: normalizedEmail,
      password: payload.password,
      createdAt: new Date().toISOString()
    };

    this.persistMembers([member, ...this.membersSubject.value]);
    this.setCurrentMember(member);
    return true;
  }

  login(payload: MemberLoginPayload): boolean {
    const members = this.reloadMembers();
    const normalizedEmail = this.normalizeEmail(payload.email);
    const member = members.find(
      (item) => item.email === normalizedEmail && item.password === payload.password
    );

    if (!member) {
      return false;
    }

    this.setCurrentMember(member);
    return true;
  }

  updatePassword(email: string, password: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    const members = this.membersSubject.value;
    const memberIndex = members.findIndex((item) => item.email === normalizedEmail);

    if (memberIndex === -1) {
      return false;
    }

    const updatedMember: MemberAccount = {
      ...members[memberIndex],
      password
    };

    const updatedMembers = [...members];
    updatedMembers[memberIndex] = updatedMember;
    this.persistMembers(updatedMembers);

    if (this.currentMemberSubject.value?.email === normalizedEmail) {
      this.currentMemberSubject.next(updatedMember);
      this.storageService.setItem(STORAGE_KEYS.memberSession, updatedMember.email);
    }

    return true;
  }

  syncFromEnrollment(payload: MemberSyncPayload): boolean {
    const normalizedEmail = this.normalizeEmail(payload.email);
    const members = this.membersSubject.value;
    const memberIndex = members.findIndex((item) => item.email === normalizedEmail);
    const updatedMember: MemberAccount = {
      id: memberIndex === -1 ? crypto.randomUUID() : members[memberIndex].id,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      email: normalizedEmail,
      password: payload.password,
      createdAt: memberIndex === -1 ? payload.createdAt : members[memberIndex].createdAt
    };

    const updatedMembers = [...members];
    if (memberIndex === -1) {
      updatedMembers.unshift(updatedMember);
    } else {
      updatedMembers[memberIndex] = updatedMember;
    }

    this.persistMembers(updatedMembers);

    if (this.currentMemberSubject.value?.email === normalizedEmail) {
      this.currentMemberSubject.next(updatedMember);
      this.storageService.setItem(STORAGE_KEYS.memberSession, updatedMember.email);
    }

    return true;
  }

  logout(): void {
    this.currentMemberSubject.next(null);
    this.storageService.removeItem(STORAGE_KEYS.memberSession);
  }

  private persistMembers(members: MemberAccount[]): void {
    this.membersSubject.next(members);
    this.storageService.setItem(STORAGE_KEYS.members, members);
  }

  private setCurrentMember(member: MemberAccount | null): void {
    this.currentMemberSubject.next(member);

    if (member) {
      this.storageService.setItem(STORAGE_KEYS.memberSession, member.email);
      return;
    }

    this.storageService.removeItem(STORAGE_KEYS.memberSession);
  }

  private reloadMembers(): MemberAccount[] {
    const members = this.storageService.getItem<MemberAccount[]>(STORAGE_KEYS.members, []);
    this.membersSubject.next(members);
    return members;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}