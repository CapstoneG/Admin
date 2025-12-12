// Admin Types for Unit and Lesson Management

export interface Language {
  id: number;
  name: string;
  code: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  language: Language;
  units: Unit[];
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
  progress: number;
  icon: string;
}

export type LessonType = 'video' | 'grammar' | 'dialogue' | 'exercise' | 'vocabulary' | 'reading';

export interface Lesson {
  id: number;
  title: string;
  orderIndex: number;
  exercises: any[];
  content: any;
  completed: boolean;
  duration: number;
  type: LessonType | null;
}

export interface CreateUnitDto {
  title: string;
  description: string;
  orderIndex: number;
}

export interface CreateLessonDto {
  unitId: number;
  title: string;
  type: LessonType;
  orderIndex: number;
  duration: number;
  content?: any;
}
