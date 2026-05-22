export type SkillLevel = 'Principiante' | 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';
export type SkillLevelStars = 1 | 2 | 3 | 4 | 5;

export const SKILL_LEVEL_STARS: Record<SkillLevel, SkillLevelStars> = {
  Principiante: 1,
  Básico: 2,
  Intermedio: 3,
  Avanzado: 4,
  Experto: 5,
};

export interface SkillDto {
  id: number;
  name: string;
  category: string;
  level: SkillLevel;
}
