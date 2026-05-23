import { Coach } from './coach.model';
import { Course } from './course.model';
import { Plan } from './plan.model';

export interface Enrollment {
  id: string;
  confirmationNumber: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  plan: Plan;
  coaches: Coach[];
  coach?: Coach | null;
  courses: Course[];
  createdAt: string;
}
