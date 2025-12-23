
import { Era, Building, ResearchTech, Manager, Rarity, RebirthUpgrade } from './types';

export const ERA_ORDER = [
  Era.STONE_AGE,
  Era.CLASSICAL_AGE,
  Era.INDUSTRIAL_AGE,
  Era.ATOMIC_AGE,
  Era.INFORMATION_AGE,
  Era.QUANTUM_AGE,
  Era.STELLAR_AGE,
  Era.GALACTIC_AGE,
  Era.TRANSCENDENCE_AGE
] as const;

export const ERA_REQUIREMENTS = {
  [Era.STONE_AGE]: 0,
  [Era.CLASSICAL_AGE]: 5000,
  [Era.INDUSTRIAL_AGE]: 250000,
  [Era.ATOMIC_AGE]: 10000000,
  [Era.INFORMATION_AGE]: 500000000,
  [Era.QUANTUM_AGE]: 25000000000,
  [Era.STELLAR_AGE]: 1e+13,
  [Era.GALACTIC_AGE]: 1e+16,
  [Era.TRANSCENDENCE_AGE]: 1e+20
} as const;

export const MILESTONES = [10, 25, 50, 100, 250, 500, 1000] as const;

export const ICON_MAP: Record<string, string> = {
  'food': '🍎', 'wood': '🪵', 'stone': '🪨', 'ore': '💎', 'tools': '🛠️', 'metal': '🧱', 'energy': '⚡', 'science': '🧪',
  'hut': '🛖', 'tree': '🌲', 'mountain_rock': '⛰️', 'workshop': '⚒️', 'art': '🎨', 'grain': '🌾',
  'pickaxe': '⛏️', 'fire': '🔥', 'sawmill': '🪚', 'wrench': '🔧', 'steam': '🚂', 'factory': '🏭',
  'atom': '☢️', 'lab': '🔬', 'brain': '🧠', 'quantum': '🌀', 'robot': '🤖', 'star': '🌟',
  'sun': '☀️', 'galaxy': '🌌', 'moon': '🌑', 'eye': '🕳️', 'crystal': '🔮',
  'centrifuge': '⚗️', 'server': '🖥️', 'foundry': '🔌', 'outpost': '🛰️', 'vortex': '🌪️', 'halo': '😇',
  'dna': '🧬', 'sparkle': '✨', 'smart_plant': '🏗️'
} as const;

// Helper to generate a unique set of managers for every building
const generateManagers = (): Record<string, Manager> => {
  const managers: Record<string, Manager> = {};
  const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'God-like'];
  const names: Record<Rarity, string[]> = {
    'Common': ['Grog', 'Joe', 'Bob', 'Jax', 'Tim', 'Dan', 'Sam', 'Mick', 'Pip', 'Zog', 'Kael', 'Finn'],
    'Uncommon': ['Kael', 'Bjorn', 'Pyra', 'Heph', 'Wu', 'Jax', 'Tesla', 'Mole', 'Vulcan', 'Watt', 'Programmer Ada'],
    'Rare': ['Lyra', 'Sven', 'Icarus', 'Elara', 'Ceres', 'Jack', 'Mole', 'Carnegie', 'Watt', 'Curie', 'Higgs'],
    'Epic': ['Silvanus', 'Gravel Lord', 'Homer', 'Industrialist Ford', 'Bessemer', 'Iron King', 'Schrodinger', 'Atom Weaver', 'Space Ghost'],
    'Legendary': ['Gaia', 'Paul Bunyan', 'Demeter', 'The Architect', 'Lord Kelvin', 'Dr. Oppen', 'Archon', 'Quantum Core', 'Event Horizon'],
    'God-like': ['Hephaestus', 'Magneto', 'Atom Lord', 'Singularity', 'Star Eater', 'Void Dredger', 'Dream Weaver', 'Chronos', 'Prometheus']
  };

  INITIAL_BUILDINGS.forEach((b) => {
    rarities.forEach((rarity, idx) => {
      const id = `m_${b.id}_${rarity.toLowerCase()}`;
      const namePool = names[rarity];
      const name = namePool[Math.floor(Math.random() * namePool.length)] + ' of ' + b.name;
      
      const boosts: Manager['boosts'] = [];
      if (rarity === 'Common') boosts.push({ type: 'yield', value: 0.1 });
      if (rarity === 'Uncommon') boosts.push({ type: 'yield', value: 0.2 });
      if (rarity === 'Rare') boosts.push({ type: 'yield', value: 0.3 }, { type: 'speed', value: 0.1 });
      if (rarity === 'Epic') boosts.push({ type: 'yield', value: 0.5 }, { type: 'speed', value: 0.3 });
      if (rarity === 'Legendary') boosts.push({ type: 'yield', value: 1.0 }, { type: 'speed', value: 0.5 }, { type: 'special', value: 0.2 });
      if (rarity === 'God-like') boosts.push({ type: 'yield', value: 5.0 }, { type: 'special', value: 2.0 });

      managers[id] = {
        id,
        buildingId: b.id,
        name,
        level: 0,
        cards: 0,
        rarity,
        boosts,
        unlocked: false,
        isActive: false
      };
    });
  });

  return managers;
};

export const INITIAL_BUILDINGS: Building[] = [
  // STONE AGE
  { id: 'b1', name: 'Foraging Hut', type: 'building', description: 'Basic survival. Gathers edible roots and berries.', baseCosts: { food: 10 }, upgradeBaseCosts: { food: 50, wood: 20 }, produces: { resource: 'food', amount: 2 }, era: Era.STONE_AGE, count: 0, upgradeLevel: 0, icon: 'hut' },
  { id: 'worker1', name: 'Lumberjack', type: 'worker', description: 'Uses strength to harvest wood. Requires food to work.', baseCosts: { food: 50 }, upgradeBaseCosts: { food: 200, stone: 50 }, produces: { resource: 'wood', amount: 1.5 }, consumes: { resource: 'food', amount: 1 }, era: Era.STONE_AGE, count: 0, upgradeLevel: 0, icon: 'tree' },
  { id: 'worker2', name: 'Rock Gatherer', type: 'worker', description: 'Collects stones for construction. Needs food.', baseCosts: { food: 80 }, upgradeBaseCosts: { food: 300, tools: 5 }, produces: { resource: 'stone', amount: 1 }, consumes: { resource: 'food', amount: 0.8 }, era: Era.STONE_AGE, count: 0, upgradeLevel: 0, icon: 'mountain_rock' },
  { id: 'b2', name: 'Flint Workshop', type: 'building', description: 'Crafts stone tools from wood and flint.', baseCosts: { wood: 100, stone: 50 }, upgradeBaseCosts: { wood: 500, stone: 200 }, produces: { resource: 'tools', amount: 0.5 }, consumes: { resource: 'wood', amount: 2 }, era: Era.STONE_AGE, count: 0, upgradeLevel: 0, icon: 'workshop' },
  { id: 'b_sci1', name: 'Cave Paintings', type: 'building', description: 'Early record keeping. Generates science.', baseCosts: { food: 200, stone: 100 }, upgradeBaseCosts: { science: 50, tools: 20 }, produces: { resource: 'science', amount: 0.2 }, era: Era.STONE_AGE, count: 0, upgradeLevel: 0, icon: 'art' },
  
  // CLASSICAL AGE
  { id: 'b3', name: 'Grain Farm', type: 'building', description: 'Systematic agriculture for mass food production.', baseCosts: { tools: 20, wood: 500 }, upgradeBaseCosts: { tools: 100, metal: 50 }, produces: { resource: 'food', amount: 15 }, era: Era.CLASSICAL_AGE, count: 0, upgradeLevel: 0, icon: 'grain' },
  { id: 'worker3', name: 'Miner', type: 'worker', description: 'Extracts raw ores. Needs tools and food.', baseCosts: { food: 200, tools: 10 }, upgradeBaseCosts: { food: 1000, metal: 100 }, produces: { resource: 'ore', amount: 4 }, consumes: { resource: 'food', amount: 5 }, era: Era.CLASSICAL_AGE, count: 0, upgradeLevel: 0, icon: 'pickaxe' },
  { id: 'b4', name: 'Smeltery', type: 'building', description: 'Refines ore into metal using wood as fuel.', baseCosts: { stone: 1000, tools: 50 }, upgradeBaseCosts: { stone: 5000, metal: 200 }, produces: { resource: 'metal', amount: 2 }, consumes: { resource: 'ore', amount: 5 }, era: Era.CLASSICAL_AGE, count: 0, upgradeLevel: 0, icon: 'fire' },
  
  // INDUSTRIAL AGE
  { id: 'b_ind_wood', name: 'Lumbermill', type: 'building', description: 'Large scale automated saws for timber.', baseCosts: { metal: 1500, stone: 5000 }, upgradeBaseCosts: { metal: 2000, tools: 500 }, produces: { resource: 'wood', amount: 150 }, consumes: { resource: 'energy', amount: 10 }, era: Era.INDUSTRIAL_AGE, count: 0, upgradeLevel: 0, icon: 'sawmill' },
  { id: 'b_ind_tools', name: 'Tool Factory', type: 'building', description: 'Mass-produces precision implements.', baseCosts: { metal: 2500, wood: 10000 }, upgradeBaseCosts: { metal: 5000, science: 1000 }, produces: { resource: 'tools', amount: 50 }, consumes: { resource: 'energy', amount: 15 }, era: Era.INDUSTRIAL_AGE, count: 0, upgradeLevel: 0, icon: 'wrench' },
  { id: 'b5', name: 'Steam Engine', type: 'building', description: 'Harnesses steam for raw energy.', baseCosts: { metal: 200, tools: 100 }, upgradeBaseCosts: { metal: 1000, ore: 500 }, produces: { resource: 'energy', amount: 10 }, consumes: { resource: 'wood', amount: 20 }, era: Era.INDUSTRIAL_AGE, count: 0, upgradeLevel: 0, icon: 'steam' },
  { id: 'b6', name: 'Steel Works', type: 'building', description: 'Massively efficient metal facility.', baseCosts: { metal: 500, energy: 20 }, upgradeBaseCosts: { metal: 2500, tools: 300 }, produces: { resource: 'metal', amount: 15 }, consumes: { resource: 'ore', amount: 20 }, era: Era.INDUSTRIAL_AGE, count: 0, upgradeLevel: 0, icon: 'factory' },
  
  // ATOMIC AGE
  { id: 'b7', name: 'Nuclear Plant', type: 'building', description: 'The pinnacle of fission energy.', baseCosts: { metal: 5000, science: 2000 }, upgradeBaseCosts: { metal: 20000, science: 5000 }, produces: { resource: 'energy', amount: 200 }, consumes: { resource: 'metal', amount: 10 }, era: Era.ATOMIC_AGE, count: 0, upgradeLevel: 0, icon: 'atom' },
  { id: 'b8', name: 'Quantum Lab', type: 'building', description: 'Bending the laws of physics.', baseCosts: { science: 5000, energy: 100 }, upgradeBaseCosts: { science: 25000, energy: 500 }, produces: { resource: 'science', amount: 150 }, consumes: { resource: 'energy', amount: 50 }, era: Era.ATOMIC_AGE, count: 0, upgradeLevel: 0, icon: 'lab' },
  { id: 'b_atomic_3', name: 'Isotope Centrifuge', type: 'building', description: 'Refining isotopes for advanced reactors.', baseCosts: { metal: 10000, tools: 2000 }, upgradeBaseCosts: { metal: 40000, science: 10000 }, produces: { resource: 'metal', amount: 120 }, consumes: { resource: 'energy', amount: 40 }, era: Era.ATOMIC_AGE, count: 0, upgradeLevel: 0, icon: 'centrifuge' },
  
  // INFORMATION AGE
  { id: 'b9', name: 'Neural Hub', type: 'building', description: 'Global brain interface.', baseCosts: { science: 100000, energy: 1000 }, upgradeBaseCosts: { science: 500000, energy: 2000 }, produces: { resource: 'science', amount: 1000 }, consumes: { resource: 'energy', amount: 200 }, era: Era.INFORMATION_AGE, count: 0, upgradeLevel: 0, icon: 'brain' },
  { id: 'b_info_2', name: 'Smart Aggregate Plant', type: 'building', description: 'AI-guided laser precision excavation for high-density building materials.', baseCosts: { tools: 50000, energy: 5000 }, upgradeBaseCosts: { tools: 200000, science: 100000 }, produces: { resource: 'stone', amount: 45000 }, consumes: { resource: 'energy', amount: 800 }, era: Era.INFORMATION_AGE, count: 0, upgradeLevel: 0, icon: 'smart_plant' },
  { id: 'b_info_3', name: 'Silicon Foundry', type: 'building', description: 'Crafting the chips of the future.', baseCosts: { metal: 100000, tools: 80000 }, upgradeBaseCosts: { metal: 400000, energy: 10000 }, produces: { resource: 'tools', amount: 1500 }, consumes: { resource: 'energy', amount: 1200 }, era: Era.INFORMATION_AGE, count: 0, upgradeLevel: 0, icon: 'foundry' },
  
  // QUANTUM AGE
  { id: 'b_q1', name: 'Qubit Array', type: 'building', description: 'Parallel processing on a cosmic scale.', baseCosts: { science: 1e+7, energy: 5000 }, upgradeBaseCosts: { science: 5e+7, energy: 10000 }, produces: { resource: 'science', amount: 1e+5 }, consumes: { resource: 'energy', amount: 1000 }, era: Era.QUANTUM_AGE, count: 0, upgradeLevel: 0, icon: 'quantum' },
  { id: 'b_q2', name: 'Nano-Fabricator', type: 'building', description: 'Building tools from the atoms up.', baseCosts: { metal: 1e+6, science: 5e+6 }, upgradeBaseCosts: { metal: 5e+8, science: 1e+8 }, produces: { resource: 'tools', amount: 5000 }, consumes: { resource: 'metal', amount: 1000 }, era: Era.QUANTUM_AGE, count: 0, upgradeLevel: 0, icon: 'robot' },
  { id: 'b_q3', name: 'Entangled Farm', type: 'building', description: 'Quantum bio-synthesis for exponential yields.', baseCosts: { science: 5e+7, tools: 1e+6 }, upgradeBaseCosts: { science: 2e+8, energy: 1e+6 }, produces: { resource: 'food', amount: 5e+6 }, consumes: { resource: 'energy', amount: 5000 }, era: Era.QUANTUM_AGE, count: 0, upgradeLevel: 0, icon: 'dna' },
  { id: 'b_q4', name: 'Molecular Assembler', type: 'building', description: 'Arranging atoms into pure structural metal.', baseCosts: { science: 1e+8, energy: 2e+4 }, upgradeBaseCosts: { science: 5e+8, energy: 1e+5 }, produces: { resource: 'metal', amount: 1e+6 }, consumes: { resource: 'energy', amount: 2000 }, era: Era.QUANTUM_AGE, count: 0, upgradeLevel: 0, icon: 'crystal' },
  
  // STELLAR AGE
  { id: 'b_s1', name: 'Dyson Patch', type: 'building', description: 'A segment of a sun-wrapping megastructure.', baseCosts: { metal: 1e+8, tools: 1e+7 }, upgradeBaseCosts: { metal: 5e+8, energy: 1e+7 }, produces: { resource: 'energy', amount: 1e+6 }, era: Era.STELLAR_AGE, count: 0, upgradeLevel: 0, icon: 'sun' },
  { id: 'b_s2', name: 'Star Forge', type: 'building', description: 'Creating heavy metals within artificial stars.', baseCosts: { energy: 1e+6, ore: 1e+9 }, upgradeBaseCosts: { energy: 5e+6, ore: 5e+9 }, produces: { resource: 'metal', amount: 1e+7 }, consumes: { resource: 'ore', amount: 1e+8 }, era: Era.STELLAR_AGE, count: 0, upgradeLevel: 0, icon: 'star' },
  { id: 'b_s3', name: 'Asteroid Outpost', type: 'building', description: 'Colonizing the rocks of deep space.', baseCosts: { metal: 5e+9, tools: 1e+8 }, upgradeBaseCosts: { metal: 2e+10, food: 1e+10 }, produces: { resource: 'ore', amount: 1e+9 }, consumes: { resource: 'food', amount: 1e+8 }, era: Era.STELLAR_AGE, count: 0, upgradeLevel: 0, icon: 'outpost' },
  
  // GALACTIC AGE
  { id: 'b_g1', name: 'Nebula Condenser', type: 'building', description: 'Harvesting the raw materials of space clouds.', baseCosts: { energy: 1e+9, science: 1e+12 }, upgradeBaseCosts: { energy: 5e+9, science: 5e+12 }, produces: { resource: 'food', amount: 1e+9 }, consumes: { resource: 'energy', amount: 1e+8 }, era: Era.GALACTIC_AGE, count: 0, upgradeLevel: 0, icon: 'galaxy' },
  { id: 'b_g2', name: 'Void Miner', type: 'building', description: 'Extracting resources from the vacuum.', baseCosts: { metal: 1e+12, science: 1e+13 }, upgradeBaseCosts: { metal: 5e+12, science: 5e+13 }, produces: { resource: 'stone', amount: 1e+10 }, consumes: { resource: 'energy', amount: 5e+9 }, era: Era.GALACTIC_AGE, count: 0, upgradeLevel: 0, icon: 'moon' },
  { id: 'b_g3', name: 'Black Hole Syphon', type: 'building', description: 'Tapping into the gravity of a singularity.', baseCosts: { energy: 1e+13, metal: 1e+13 }, upgradeBaseCosts: { energy: 5e+13, science: 1e+14 }, produces: { resource: 'energy', amount: 1e+12 }, consumes: { resource: 'science', amount: 1e+11 }, era: Era.GALACTIC_AGE, count: 0, upgradeLevel: 0, icon: 'vortex' },
  
  // TRANSCENDENCE AGE
  { id: 'b_t1', name: 'Singularity Core', type: 'building', description: 'Infinite computational power at the event horizon.', baseCosts: { science: 1e+15, energy: 1e+12 }, upgradeBaseCosts: { science: 1e+16, energy: 1e+13 }, produces: { resource: 'science', amount: 1e+14 }, era: Era.TRANSCENDENCE_AGE, count: 0, upgradeLevel: 0, icon: 'eye' },
  { id: 'b_t2', name: 'Reality Weaver', type: 'building', description: 'Converting digital thought into physical existence.', baseCosts: { science: 1e+18, metal: 1e+15 }, upgradeBaseCosts: { science: 1e+19, metal: 1e+16 }, produces: { resource: 'metal', amount: 1e+16 }, era: Era.TRANSCENDENCE_AGE, count: 0, upgradeLevel: 0, icon: 'sparkle' },
  { id: 'b_t3', name: 'Aureole Array', type: 'building', description: 'Manifesting pure energy through consensus.', baseCosts: { science: 1e+20, tools: 1e+18 }, upgradeBaseCosts: { science: 1e+21, energy: 1e+18 }, produces: { resource: 'energy', amount: 1e+18 }, consumes: { resource: 'science', amount: 1e+17 }, era: Era.TRANSCENDENCE_AGE, count: 0, upgradeLevel: 0, icon: 'halo' }
] as const;

export const INITIAL_MANAGERS: Record<string, Manager> = generateManagers();

export const RESEARCH_TECHS: ResearchTech[] = [
  // --- STONE AGE ---
  { id: 't_b1', name: 'Advanced Foraging', era: Era.STONE_AGE, cost: 20, description: 'Knowledge of roots and berries increases Foraging Hut food yield by 50%.', icon: 'hut', bonus: { type: 'production', target: 'food', value: 1.5 } },
  { id: 't1', name: 'Sharp Flint', era: Era.STONE_AGE, cost: 50, description: 'Improved cutting edges. Lumberjacks harvest 50% more Wood.', icon: 'tree', bonus: { type: 'production', target: 'wood', value: 1.5 } },
  { id: 't_worker2', name: 'Rock Sleds', era: Era.STONE_AGE, cost: 100, description: 'Crude sleds allow Rock Gatherers to transport 50% more stones.', icon: 'mountain_rock', bonus: { type: 'production', target: 'stone', value: 1.5 } },
  { id: 't_b2', name: 'Tool Standardization', era: Era.STONE_AGE, cost: 250, description: 'Defining clear designs boosts Flint Workshop output by 40%.', icon: 'workshop', bonus: { type: 'production', target: 'tools', value: 1.4 } },
  { id: 't_sci1', name: 'Oral Tradition', era: Era.STONE_AGE, cost: 400, description: 'Passing down legends increases Science gain from Cave Paintings by 100%.', icon: 'art', bonus: { type: 'production', target: 'science', value: 2.0 } },
  { id: 't2', name: 'Fire Control', era: Era.STONE_AGE, cost: 600, description: 'Mastery of the flame reduces worker Food consumption by 20%.', icon: 'fire', bonus: { type: 'consumption_reduction', target: 'all', value: 0.8 } },
  
  // --- CLASSICAL AGE ---
  { id: 't4', name: 'Irrigation', era: Era.CLASSICAL_AGE, cost: 1200, description: 'Systematic watering yields 60% more Food from Grain Farms.', icon: 'grain', bonus: { type: 'production', target: 'food', value: 1.6 } },
  { id: 't_worker3', name: 'Deep Pits', era: Era.CLASSICAL_AGE, cost: 3000, description: 'Digging deeper allow Miners to extract 50% more Ore.', icon: 'pickaxe', bonus: { type: 'production', target: 'ore', value: 1.5 } },
  { id: 't_b4', name: 'Blast Bellows', era: Era.CLASSICAL_AGE, cost: 8000, description: 'Increased airflow increases Smeltery metal output by 80%.', icon: 'fire', bonus: { type: 'production', target: 'metal', value: 1.8 } },
  { id: 't5', name: 'Alloy Mixing', era: Era.CLASSICAL_AGE, cost: 25000, description: 'Advanced metallurgy makes Metal refinement 30% cheaper.', icon: 'fire', bonus: { type: 'cost_reduction', target: 'metal', value: 0.7 } },
  { id: 't6', name: 'Philosophy', era: Era.CLASSICAL_AGE, cost: 50000, description: 'Abstract thought increases Science gain from all sources by 50%.', icon: 'art', bonus: { type: 'science_gain', target: 'all', value: 1.5 } },
  
  // --- INDUSTRIAL AGE ---
  { id: 't_ind_wood', name: 'Circular Saws', era: Era.INDUSTRIAL_AGE, cost: 80000, description: 'Steam-powered blades make Lumbermills 100% more productive.', icon: 'sawmill', bonus: { type: 'production', target: 'wood', value: 2.0 } },
  { id: 't_ind_tools', name: 'Interchangeable Parts', era: Era.INDUSTRIAL_AGE, cost: 150000, description: 'Standardized components boost Tool Factory output by 150%.', icon: 'wrench', bonus: { type: 'production', target: 'tools', value: 2.5 } },
  { id: 't_steam', name: 'High-Pressure Boilers', era: Era.INDUSTRIAL_AGE, cost: 300000, description: 'Tighter seals increase Steam Engine energy yield by 100%.', icon: 'steam', bonus: { type: 'production', target: 'energy', value: 2.0 } },
  { id: 't_steel', name: 'Bessemer Process', era: Era.INDUSTRIAL_AGE, cost: 600000, description: 'Oxidizing impurities makes Steel Works 200% more efficient.', icon: 'factory', bonus: { type: 'production', target: 'metal', value: 3.0 } },
  { id: 't7', name: 'Electric Grid', era: Era.INDUSTRIAL_AGE, cost: 1200000, description: 'Copper wiring boosts all Industrial Age production by 50%.', icon: 'factory', bonus: { type: 'production', target: 'all', value: 1.5 } },
  
  // --- ATOMIC AGE ---
  { id: 't9', name: 'Nuclear Fission', era: Era.ATOMIC_AGE, cost: 2500000, description: 'Optimized fuel rods double Nuclear Plant energy production.', icon: 'atom', bonus: { type: 'production', target: 'energy', value: 2.0 } },
  { id: 't_b8', name: 'Particle Accelerators', era: Era.ATOMIC_AGE, cost: 6000000, description: 'Collision experiments boost Quantum Lab science output by 200%.', icon: 'lab', bonus: { type: 'production', target: 'science', value: 3.0 } },
  { id: 't_atomic_2', name: 'Gas Diffusion', era: Era.ATOMIC_AGE, cost: 15000000, description: 'Better membranes allow Isotope Centrifuges to produce 150% more metal.', icon: 'centrifuge', bonus: { type: 'production', target: 'metal', value: 2.5 } },
  
  // --- INFORMATION AGE ---
  { id: 't10', name: 'Global Network', era: Era.INFORMATION_AGE, cost: 40000000, description: 'Instant data exchange. Neural Hubs produce 300% more Science.', icon: 'brain', bonus: { type: 'production', target: 'science', value: 4.0 } },
  { id: 't_info_2', name: 'Precision Extraction', era: Era.INFORMATION_AGE, cost: 100000000, description: 'Advanced geodetic sensors. Smart Aggregate Plants yield 400% more Stone.', icon: 'smart_plant', bonus: { type: 'production', target: 'stone', value: 5.0 } },
  { id: 't_info_3', name: 'Extreme Ultraviolet Lithography', era: Era.INFORMATION_AGE, cost: 250000000, description: 'Precision etching boosts Silicon Foundry tool yield by 300%.', icon: 'foundry', bonus: { type: 'production', target: 'tools', value: 4.0 } },
  
  // --- QUANTUM AGE ---
  { id: 't11', name: 'Quantum Correction', era: Era.QUANTUM_AGE, cost: 800000000, description: 'Removing noise allows Qubit Arrays to produce 500% more Science.', icon: 'quantum', bonus: { type: 'production', target: 'science', value: 6.0 } },
  { id: 't_nano', name: 'Molecular Printing', era: Era.QUANTUM_AGE, cost: 2000000000, description: 'Building from scratch. Nano-Fabricators produce 400% more Tools.', icon: 'robot', bonus: { type: 'production', target: 'tools', value: 5.0 } },
  { id: 't_q3', name: 'Bio-Sync', era: Era.QUANTUM_AGE, cost: 5000000000, description: 'Entangled nutrition allows Entangled Farms to yield 600% more Food.', icon: 'dna', bonus: { type: 'production', target: 'food', value: 7.0 } },
  { id: 't_q4', name: 'Atomic Glue', era: Era.QUANTUM_AGE, cost: 12000000000, description: 'Stronger bonds allow Molecular Assemblers to yield 500% more Metal.', icon: 'crystal', bonus: { type: 'production', target: 'metal', value: 6.0 } },
  
  // --- STELLAR AGE ---
  { id: 't13', name: 'Dyson Swarm Optimization', era: Era.STELLAR_AGE, cost: 5e+13, description: 'Perfect alignment allows Dyson Patches to yield 1000% more Energy.', icon: 'sun', bonus: { type: 'production', target: 'energy', value: 11.0 } },
  { id: 't_s2', name: 'Gravitational Compression', era: Era.STELLAR_AGE, cost: 1.5e+14, description: 'Simulating core pressure allows Star Forges to yield 800% more Metal.', icon: 'star', bonus: { type: 'production', target: 'metal', value: 9.0 } },
  { id: 't_stellar_3', name: 'Mag-Lev Extractors', era: Era.STELLAR_AGE, cost: 4e+14, description: 'Magnetic sifting allows Asteroid Outposts to yield 1000% more Ore.', icon: 'outpost', bonus: { type: 'production', target: 'ore', value: 11.0 } },
  
  // --- GALACTIC AGE ---
  { id: 't_g1', name: 'Nebula Sifting', era: Era.GALACTIC_AGE, cost: 2e+15, description: 'Catching cosmic dust. Nebula Condensers yield 1000% more Food.', icon: 'galaxy', bonus: { type: 'production', target: 'food', value: 11.0 } },
  { id: 't_g2', name: 'Void Resonance', era: Era.GALACTIC_AGE, cost: 6e+15, description: 'Deep vacuum tuning allows Void Miners to yield 1000% more Stone.', icon: 'moon', bonus: { type: 'production', target: 'stone', value: 11.0 } },
  { id: 't_galactic_1', name: 'Hawking Capture', era: Era.GALACTIC_AGE, cost: 1.5e+16, description: 'Capturing radiation allows Black Hole Syphons to yield 1000% more Energy.', icon: 'vortex', bonus: { type: 'production', target: 'energy', value: 11.0 } },
  
  // --- TRANSCENDENCE AGE ---
  { id: 't_sing_core', name: 'Infinite Memory', era: Era.TRANSCENDENCE_AGE, cost: 2e+18, description: 'Perfect retention allows Singularity Cores to yield 50x more Science.', icon: 'eye', bonus: { type: 'production', target: 'science', value: 50.0 } },
  { id: 't_weaver', name: 'Conceptual Printing', era: Era.TRANSCENDENCE_AGE, cost: 8e+18, description: 'Thought to matter. Reality Weavers yield 50x more Metal.', icon: 'sparkle', bonus: { type: 'production', target: 'metal', value: 50.0 } },
  { id: 't_trans_1', name: 'Divine Resonance', era: Era.TRANSCENDENCE_AGE, cost: 3e+19, description: 'Agreement with the universe. Aureole Arrays yield 50x more Energy.', icon: 'halo', bonus: { type: 'production', target: 'energy', value: 50.0 } }
] as const;

export const REBIRTH_UPGRADES: RebirthUpgrade[] = [
  { id: 'rb_yield_1', name: 'Ancestral Blessing', description: 'Permanent 50% boost to all production.', shortDescription: '+50% Production Boost', cost: 5, icon: '✨', bonus: { type: 'production', target: 'all', value: 1.5 } },
  { id: 'rb_sci_1', name: 'Ethereal Insight', description: 'Start every timeline with 200% more science gain.', shortDescription: '+200% Science Gained', cost: 10, icon: '🧠', bonus: { type: 'science_gain', target: 'all', value: 3.0 } },
  { id: 'rb_res_1', name: 'Earthly Affinity', description: 'Wood and Stone costs reduced by 20%.', shortDescription: '-20% Wood/Stone Cost', cost: 15, icon: '🌍', bonus: { type: 'cost_reduction', target: 'all', value: 0.8 } },
  { id: 'rb_cost_1', name: 'Timeline Efficiency', description: 'Buildings are 20% cheaper in all eras.', shortDescription: '-20% Building Cost', cost: 25, icon: '📉', bonus: { type: 'cost_reduction', target: 'all', value: 0.8 } },
  { id: 'rb_ore_1', name: 'Deep Core Extraction', description: 'Ore production multiplied by 2.0.', shortDescription: 'x2.0 Ore Yield', cost: 35, icon: '⛏️', bonus: { type: 'production', target: 'ore', value: 2.0 } },
  { id: 'rb_manual_1', name: 'Divine Hand', description: 'Manual gathering yields 500% more resources.', shortDescription: '+500% Manual Yield', cost: 50, icon: '🖐️', bonus: { type: 'manual_yield', target: 'all', value: 6.0 } },
  { id: 'rb_tools_1', name: 'Arcane Machinery', description: 'Tools production multiplied by 2.5.', shortDescription: 'x2.5 Tool Output', cost: 75, icon: '⚙️', bonus: { type: 'production', target: 'tools', value: 2.5 } },
  { id: 'rb_yield_2', name: 'Legacy of Giants', description: 'Production increased by another 200%.', shortDescription: '+200% Production Boost', cost: 100, icon: '🏛️', bonus: { type: 'production', target: 'all', value: 3.0 } },
  { id: 'rb_metal_1', name: 'Industrial Prowess', description: 'Metal production multiplied by 3.0.', shortDescription: 'x3.0 Metal Output', cost: 150, icon: '🏭', bonus: { type: 'production', target: 'metal', value: 3.0 } },
  { id: 'rb_speed_1', name: 'Chronos Gaze', description: 'Production boosted by 100% (Manager Synergy).', shortDescription: 'x2.0 Synergy Boost', cost: 200, icon: '⏳', bonus: { type: 'production', target: 'all', value: 2.0 } },
  { id: 'rb_cons_1', name: 'Void Resonance', description: 'Energy consumption reduced by 50%.', shortDescription: '-50% Energy Use', cost: 300, icon: '🌑', bonus: { type: 'consumption_reduction', target: 'energy', value: 0.5 } },
  { id: 'rb_over_1', name: 'Temporal Overclock', description: 'All production multiplied by 5.0.', shortDescription: 'x5.0 Total Production', cost: 450, icon: '⚡', bonus: { type: 'production', target: 'all', value: 5.0 } },
  { id: 'rb_blue_1', name: 'Master Blueprint', description: 'All building and worker costs reduced by 40%.', shortDescription: '-40% All Costs', cost: 600, icon: '📜', bonus: { type: 'cost_reduction', target: 'all', value: 0.6 } },
  { id: 'rb_sci_2', name: 'Scientific Revolution', description: 'Science gain multiplied by 10.0.', shortDescription: 'x10.0 Science Gain', cost: 850, icon: '🧬', bonus: { type: 'science_gain', target: 'all', value: 10.0 } },
  { id: 'rb_ener_1', name: 'Stellar Harvest', description: 'Energy production multiplied by 10.0.', shortDescription: 'x10.0 Energy Output', cost: 1250, icon: '🌞', bonus: { type: 'production', target: 'energy', value: 10.0 } },
  { id: 'rb_yield_3', name: 'Universal Synergy', description: 'All production multiplied by 10.0.', shortDescription: 'x10.0 All Production', cost: 2000, icon: '🌌', bonus: { type: 'production', target: 'all', value: 10.0 } },
  { id: 'rb_cost_2', name: 'Reality Bender', description: 'All costs reduced by 60%.', shortDescription: '-60% All Costs', cost: 5000, icon: '🕳️', bonus: { type: 'cost_reduction', target: 'all', value: 0.4 } },
  { id: 'rb_omega_1', name: 'Omega Timeline', description: 'Final tier. All production multiplied by 50.0.', shortDescription: 'x50.0 Final Multiplier', cost: 10000, icon: '⚛️', bonus: { type: 'production', target: 'all', value: 50.0 } }
];
