import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Course } from '../models/course.model';
import { DEFAULT_COURSES } from '../utils/mock-data';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly coursesSubject = new BehaviorSubject<Course[]>([]);
  readonly courses$ = this.coursesSubject.asObservable();

  constructor(private readonly storageService: StorageService) {
    const courses = this.storageService.getItem<Course[]>(STORAGE_KEYS.courses, []);
    if (courses.length === 0) {
      this.storageService.setItem(STORAGE_KEYS.courses, DEFAULT_COURSES);
      this.coursesSubject.next(DEFAULT_COURSES);
      return;
    }

    this.coursesSubject.next(courses);
  }

  getAll(): Course[] {
    return this.coursesSubject.value;
  }

  getById(id: string): Course | undefined {
    return this.getAll().find((course) => course.id === id);
  }

  create(course: Course): void {
    this.persist([...this.getAll(), course]);
  }

  update(updatedCourse: Course): void {
    this.persist(this.getAll().map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
  }

  delete(id: string): void {
    this.persist(this.getAll().filter((course) => course.id !== id));
  }

  private persist(courses: Course[]): void {
    this.storageService.setItem(STORAGE_KEYS.courses, courses);
    this.coursesSubject.next(courses);
  }
}
