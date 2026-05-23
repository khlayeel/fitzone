export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  maxCoaches: number;
  maxCourses: number;
  restrictions?: string;
}
