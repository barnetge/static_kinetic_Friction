export interface Surface {
  id: string;
  name: string;
  subtitle: string;
  staticMu: number; // Coefficient of static friction (μs)
  kineticMu: number; // Coefficient of kinetic friction (μk)
  bgColor: string;
  borderColor: string;
  textureType: 'ice' | 'wood' | 'carpet' | 'sandpaper' | 'rubber';
  icon: string;
  kidFact: string;
}

export interface PushObject {
  id: string;
  name: string;
  mass: number; // in kg
  icon: string;
  emoji: string;
  color: string;
  description: string;
  width: number;
  height: number;
}

export interface VectorDisplayOptions {
  showAppliedForce: boolean; // Push force
  showFriction: boolean; // Static / kinetic friction
  showNetForce: boolean; // Net force
  showVerticalForces: boolean; // Gravity and Normal force
  showActionReaction: boolean; // Action-Reaction pairs (Newton's 3rd Law)
  showValues: boolean; // Show numbers (e.g. 150 N)
  showKidLabels: boolean; // Show fun kid words like "Balanced!" or "Zooming!"
}

export interface SimState {
  pushForce: number; // in Newtons
  position: number; // in meters (0 to 12)
  velocity: number; // in m/s
  acceleration: number; // in m/s²
  isMoving: boolean;
  justBrokeFree: boolean;
  normalForce: number; // N = m * g
  gravityForce: number; // Fg = m * g
  maxStaticFriction: number; // Fs_max = μs * N
  kineticFriction: number; // Fk = μk * N
  currentFriction: number; // Live friction value
  netForce: number; // Fnet = Fpush - Ffriction
}

export const SURFACES: Surface[] = [
  {
    id: 'ice',
    name: 'Slick Ice Rink',
    subtitle: 'Ultra low friction',
    staticMu: 0.15,
    kineticMu: 0.08,
    bgColor: '#e0f2fe',
    borderColor: '#38bdf8',
    textureType: 'ice',
    icon: '❄️',
    kidFact: 'Ice is so slippery because a thin layer of water forms under pressure!',
  },
  {
    id: 'wood',
    name: 'Gym Wood Floor',
    subtitle: 'Polished & smooth',
    staticMu: 0.35,
    kineticMu: 0.25,
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
    textureType: 'wood',
    icon: '🪵',
    kidFact: 'Basketball players wear rubber soles to grip onto smooth gym floors!',
  },
  {
    id: 'carpet',
    name: 'Classroom Carpet',
    subtitle: 'Standard floor (μ = 0.55)',
    staticMu: 0.55,
    kineticMu: 0.38,
    bgColor: '#e0e7ff',
    borderColor: '#6366f1',
    textureType: 'carpet',
    icon: '🧶',
    kidFact: 'Tiny carpet fibers hook into tiny bumps on the box like microscopic Velcro!',
  },
  {
    id: 'sandpaper',
    name: 'Rough Sidewalk',
    subtitle: 'Gritty rock & sand',
    staticMu: 0.85,
    kineticMu: 0.70,
    bgColor: '#fed7aa',
    borderColor: '#f97316',
    textureType: 'sandpaper',
    icon: '🧱',
    kidFact: 'Rough rock edges crash into each other, creating huge static resistance!',
  },
  {
    id: 'rubber',
    name: 'Sticky Rubber Mat',
    subtitle: 'Maximum grip!',
    staticMu: 1.15,
    kineticMu: 0.90,
    bgColor: '#fce7f3',
    borderColor: '#ec4899',
    textureType: 'rubber',
    icon: '🛑',
    kidFact: 'Rubber grips so tightly that its static friction can be even higher than its weight!',
  },
];

export const PUSH_OBJECTS: PushObject[] = [
  {
    id: 'gift',
    name: 'Gift Box',
    mass: 5,
    icon: '🎁',
    emoji: '🎁',
    color: '#ec4899',
    description: 'Light birthday present full of balloons & confetti (5 kg)',
    width: 70,
    height: 70,
  },
  {
    id: 'crate',
    name: 'Wooden Crate',
    mass: 20,
    icon: '📦',
    emoji: '📦',
    color: '#d97706',
    description: 'Medium supply crate with camping gear and snacks (20 kg)',
    width: 90,
    height: 90,
  },
  {
    id: 'chest',
    name: '50 kg Block',
    mass: 50,
    icon: '📦',
    emoji: '📦',
    color: '#eab308',
    description: 'Heavy 50 kg block packed with supplies and weight (50 kg)',
    width: 105,
    height: 95,
  },
  {
    id: 'safe',
    name: 'Bank Safe',
    mass: 100,
    icon: '🔒',
    emoji: '🔒',
    color: '#475569',
    description: 'Heavy duty steel safe with combination lock (100 kg)',
    width: 120,
    height: 110,
  },
  {
    id: 'piano',
    name: 'Concert Piano',
    mass: 200,
    icon: '🎹',
    emoji: '🎹',
    color: '#0f172a',
    description: 'Heavy concert piano with cast iron harp and wooden soundboard (200 kg)',
    width: 130,
    height: 110,
  },
];
