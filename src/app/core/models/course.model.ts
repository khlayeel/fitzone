export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  duration: string;
  schedule: string;
  capacity: number;
}
