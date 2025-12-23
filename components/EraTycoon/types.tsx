
export enum Era {
  STONE_AGE = 'Stone Age',
  CLASSICAL_AGE = 'Classical Age',
  INDUSTRIAL_AGE = 'Industrial Age',
  ATOMIC_AGE = 'Atomic Age',
  INFORMATION_AGE = 'Information Age',
  QUANTUM_AGE = 'Quantum Age',
  STELLAR_AGE = 'Stellar Age',
  GALACTIC_AGE = 'Galactic Age',
  TRANSCENDENCE_AGE = 'Transcendence Age'
}

export type ResourceType = 'food' | 'wood' | 'stone' | 'ore' | 'tools' | 'metal' | 'energy' | 'science';

export interface ResourceMap {
  food: number;
  wood: number;
  stone: number;
  ore: number;
  tools: number;
  metal: number;
  energy: number;
  science: number;
}

export type BonusType = 'production' | 'cost_reduction' | 'consumption_reduction' | 'manual_yield' | 'science_gain';

export interface ResearchTech {
  id: string;
  name: string;
  description: string;
  cost: number;
  era: Era;
  bonus: {
    type: BonusType;
    value: number; // e.g. 0.9 for 10% reduction, 1.2 for 20% boost
    target?: ResourceType | 'all';
  };
  icon: string;
}

export interface RebirthUpgrade {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  cost: number;
  bonus: {
    type: BonusType;
    value: number;
    target?: ResourceType | 'all';
  };
  icon: string;
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'God-like';

export interface ManagerBoost {
  type: 'yield' | 'speed' | 'efficiency' | 'special';
  value: number;
}

export interface Manager {
  id: string;
  buildingId: string;
  name: string;
  level: number;
  cards: number;
  rarity: Rarity;
  boosts: ManagerBoost[];
  unlocked: boolean;
  isActive: boolean;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  type: 'building' | 'worker';
  baseCosts: Partial<ResourceMap>;
  upgradeBaseCosts?: Partial<ResourceMap>;
  produces: {
    resource: ResourceType;
    amount: number;
  };
  consumes?: {
    resource: ResourceType;
    amount: number;
  };
  era: Era;
  count: number;
  upgradeLevel: number;
  icon: string;
}

export interface GameState {
  resources: ResourceMap;
  totalScienceEarned: number;
  currentEra: Era;
  buildings: Record<string, Building>;
  researchedTechIds: string[];
  managers: Record<string, Manager>;
  lastUpdate: number;
  slotId: number;
  rebirthCount: number;
  rebirthPoints: number;
  totalRebirthPointsEarned: number;
  rebirthUpgradeIds: string[];
}

export interface SaveMetadata {
  id: number;
  era: Era;
  science: number;
  timestamp: number;
  isEmpty: boolean;
  isMain: boolean;
  rebirthCount?: number;
}

export interface AdvisorMessage {
  role: 'ai' | 'player';
  text: string;
  timestamp: number;
}
