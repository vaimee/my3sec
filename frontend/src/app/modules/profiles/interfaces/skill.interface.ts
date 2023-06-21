export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface ProfileSkill extends Skill {
  icon?: string;
  progress: number;
}
