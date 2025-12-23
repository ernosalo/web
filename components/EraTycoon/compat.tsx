
import { SAVE_VERSION, unpack, migrateGameState, MASTER_REGISTRY_KEY } from './logic';

/**
 * Parsers archives from a packed string.
 * Supports:
 * 1. New structured format { version, registry, slots }
 * 2. Flat localStorage dump format Record<string, string>
 * 3. Raw GameState object (single slot backup)
 */
export const parseArchive = (data: string): any => {
  const raw = unpack(data);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    
    // Strategy A: New structured format
    if (parsed && typeof parsed === 'object' && parsed.version !== undefined && parsed.registry && parsed.slots) {
      return parsed;
    }

    // Strategy B: Legacy Flat LocalStorage Dump (Record<string, string>)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      const isDump = keys.some(k => 
        k.includes('era-tycoon') || 
        k.includes('registry') || 
        k.includes('active') ||
        k.includes('era-nexus')
      );

      if (isDump) {
        const slots: Record<string, any> = {};
        let registry: any[] = [];
        
        keys.forEach(k => {
          const val = parsed[k];
          if (!val) return;

          // Identify slots (e.g., era-tycoon-v15-slot-1)
          if (k.includes('slot-')) {
            const parts = k.split('slot-');
            const id = parts[parts.length - 1];
            try {
              slots[id] = JSON.parse(val);
            } catch (e) {
              console.warn(`Failed to parse slot ${id} in dump`, e);
            }
          } 
          // Identify registry (metadata about saves)
          else if (k.includes('registry')) {
            try {
              registry = JSON.parse(val);
            } catch (e) {
              console.warn("Failed to parse registry in dump", e);
            }
          }
        });

        // If we found slots but no registry, reconstruct a basic registry
        if (Object.keys(slots).length > 0 && registry.length === 0) {
          registry = Object.entries(slots).map(([id, state]) => ({
            id: Number(id),
            era: state.currentEra || 'Stone Age',
            science: state.resources?.science || 0,
            timestamp: state.lastUpdate || Date.now(),
            isEmpty: false,
            isMain: Number(id) === 1
          }));
        }

        return {
          version: SAVE_VERSION,
          registry: registry,
          slots: slots
        };
      }
    }

    // Strategy C: Single GameState object (bare save)
    if (parsed && parsed.buildings && parsed.currentEra) {
      const slotId = parsed.slotId || 1;
      return {
        version: SAVE_VERSION,
        registry: [{
          id: slotId,
          era: parsed.currentEra,
          science: parsed.resources?.science || 0,
          timestamp: parsed.lastUpdate || Date.now(),
          isEmpty: false,
          isMain: true
        }],
        slots: { [slotId]: parsed }
      };
    }
    
    return null;
  } catch (e) {
    console.error("Archive parse failed", e);
    return null;
  }
};
