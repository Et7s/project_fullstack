// sportcenter-wireframes/src/types/index.ts
export interface SectionExercise {
  title: string;
  description: string;
  purpose: string;
}

export interface Section {
  id: number;
  name: string;
  category: string;
  description: string;
  schedule: string;
  trainer: string;
  level?: 'beginner' | 'amateur' | 'pro';
  image_url?: string;
  image_alt?: string;
  what_you_will_do?: string[];
  exercises?: SectionExercise[];
}

export interface DiaryEntry {
  id: number;
  date: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  notes: string;
  feeling: number;
}

export interface Recommendation {
  id: number;
  date: string;
  text: string;
  type: 'rest' | 'increase' | 'maintain';
  title?: string;
  summary?: string;
  basis?: string[];
  actions?: string[];
  warning?: string | null;
}
