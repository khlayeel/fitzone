import { Coach } from '../models/coach.model';
import { Course } from '../models/course.model';
import { Enrollment } from '../models/enrollment.model';
import { Plan } from '../models/plan.model';

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    price: 60,
    description: 'L essentiel pour démarrer avec régularité.',
    features: ['Accès salle 6j/7', '4 cours / mois', 'Aucun coach personnel'],
    maxCoaches: 0,
    maxCourses: 4,
    restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. Basic inclut 4 cours par mois et aucun coach personnel.'
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    price: 90,
    description: 'Le meilleur équilibre entre coaching et liberté.',
    features: ['Tout Basic', 'Cours collectifs illimités', 'Jusqu à 2 coachs personnels'],
    popular: true,
    maxCoaches: 2,
    maxCourses: 999,
    restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. Premium inclut des cours illimités et jusqu à 2 coachs.'
  },
  {
    id: 'plan-vip',
    name: 'VIP',
    price: 120,
    description: 'L expérience premium FitZone sans compromis.',
    features: ['Tout Premium', 'Coaching prioritaire', 'Programme nutrition personnalisé'],
    maxCoaches: 999,
    maxCourses: 999,
    restrictions: 'FitZone encadre ce plan avec 15 membres maximum par coach et 25 membres maximum par cours. VIP offre un accès illimité aux coachs et aux cours.'
  }
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-hiit-burn',
    title: 'HIIT Burn',
    description: 'Séance explosive pour brûler un maximum de calories.',
    level: 'Intermédiaire',
    duration: '45 min',
    schedule: 'Lun / Mer / Ven - 18:00',
    capacity: 18
  },
  {
    id: 'course-yoga-flow',
    title: 'Yoga Flow',
    description: 'Mobilité, respiration et renforcement profond.',
    level: 'Débutant',
    duration: '60 min',
    schedule: 'Mar / Jeu - 08:00',
    capacity: 20
  },
  {
    id: 'course-cross-training',
    title: 'Cross Training',
    description: 'Circuit complet force, cardio et coordination.',
    level: 'Avancé',
    duration: '50 min',
    schedule: 'Lun / Jeu - 19:30',
    capacity: 14
  },
  {
    id: 'course-boxe-fit',
    title: 'Boxe Fit',
    description: 'Technique et cardio intense sur sac et atelier.',
    level: 'Intermédiaire',
    duration: '55 min',
    schedule: 'Sam - 10:00',
    capacity: 16
  },
  {
    id: 'course-pilates-core',
    title: 'Pilates Core',
    description: 'Travail postural et gainage intelligent.',
    level: 'Débutant',
    duration: '45 min',
    schedule: 'Mar / Ven - 12:30',
    capacity: 15
  },
  {
    id: 'course-spinning-rush',
    title: 'Spinning Rush',
    description: 'Ride énergique guidé par rythme et intensité.',
    level: 'Intermédiaire',
    duration: '40 min',
    schedule: 'Mer / Ven - 07:00',
    capacity: 22
  },
  {
    id: 'course-power-lift',
    title: 'Power Lift',
    description: 'Technique de base sur squat, bench et deadlift.',
    level: 'Avancé',
    duration: '70 min',
    schedule: 'Sam - 14:00',
    capacity: 10
  },
  {
    id: 'course-zumba-vibes',
    title: 'Zumba Vibes',
    description: 'Cours dansé et cardio pour progresser en s amusant.',
    level: 'Débutant',
    duration: '50 min',
    schedule: 'Dim - 11:00',
    capacity: 24
  }
];

export const DEFAULT_COACHES: Coach[] = [
  {
    id: 'coach-aymen',
    name: 'Aymen Trabelsi',
    specialty: 'Musculation',
    availability: 'Lun - Ven, 07:00 - 15:00',
    bio: 'Expert prise de masse et correction technique.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  },
  {
    id: 'coach-ines',
    name: 'Ines Ben Salem',
    specialty: 'Cardio',
    availability: 'Lun - Sam, 09:00 - 17:00',
    bio: 'Spécialiste endurance, perte de poids et motivation durable.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  },
  {
    id: 'coach-sami',
    name: 'Sami Hadded',
    specialty: 'Cross Training',
    availability: 'Mar - Dim, 14:00 - 22:00',
    bio: 'Coaching intensif et performance fonctionnelle.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  },
  {
    id: 'coach-mariem',
    name: 'Mariem Gharbi',
    specialty: 'Yoga',
    availability: 'Lun / Mer / Ven, 08:00 - 18:00',
    bio: 'Souplesse, mobilité et récupération active.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  },
  {
    id: 'coach-youssef',
    name: 'Youssef Karray',
    specialty: 'Boxe',
    availability: 'Jeu - Dim, 16:00 - 22:00',
    bio: 'Technique boxe, explosivité et gain cardio.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  },
  {
    id: 'coach-sarra',
    name: 'Sarra Mansouri',
    specialty: 'Pilates',
    availability: 'Lun - Ven, 10:00 - 19:00',
    bio: 'Travail profond du centre et posture durable.',
    photoUrl: '/assets/images/coach-placeholder.svg'
  }
];

export const DEFAULT_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enrollment-1',
    confirmationNumber: 'FZ-20240504-1234',
    fullName: 'Samir Ben Ali',
    phone: '12345678',
    email: 'samir@test.tn',
    password: 'password123',
    plan: DEFAULT_PLANS[0], // Basic
    coaches: [],
    coach: null,
    courses: [DEFAULT_COURSES[0], DEFAULT_COURSES[1]], // HIIT Burn, Yoga Flow
    createdAt: '2024-05-04T12:00:00.000Z'
  },
  {
    id: 'enrollment-2',
    confirmationNumber: 'FZ-20240503-5678',
    fullName: 'Ahmed Mansouri',
    phone: '87654321',
    email: 'ahmed@test.tn',
    password: 'password456',
    plan: DEFAULT_PLANS[1], // Premium
    coaches: [DEFAULT_COACHES[1], DEFAULT_COACHES[2]],
    coach: DEFAULT_COACHES[1], // Legacy compatibility
    courses: [DEFAULT_COURSES[2], DEFAULT_COURSES[3]], // Cross Training, Boxe Fit
    createdAt: '2024-05-03T14:30:00.000Z'
  }
];
