// Dirección visual: Amber War Room — datos compactos, ceremoniales y legibles; cada runa expresa una decisión de Ingrid, no una decoración.

export type RuneId = "urd" | "isa" | "nauthiz" | "perthro";

export type RuneAbility = {
  id: RuneId;
  key: string;
  glyph: string;
  name: string;
  effect: string;
  cost: number;
  cooldown: number;
  color: string;
};

export const RUNE_ABILITIES: RuneAbility[] = [
  { id: "urd", key: "1", glyph: "ᚢ", name: "Hilo de Urd", effect: "Marca", cost: 8, cooldown: 1.2, color: "amber" },
  { id: "isa", key: "2", glyph: "ᛁ", name: "Isa", effect: "Hielo", cost: 18, cooldown: 5, color: "ice" },
  { id: "nauthiz", key: "3", glyph: "ᚾ", name: "Nauthiz", effect: "Necesidad", cost: 24, cooldown: 8, color: "carmine" },
  { id: "perthro", key: "4", glyph: "ᛈ", name: "Perthro", effect: "Paso", cost: 12, cooldown: 4, color: "violet" },
];

export const NARRATIVE_BEATS = {
  opening: {
    chapter: "PRÓLOGO · EL SILENCIO DE AGNAR",
    title: "Cuando murió Agnar, la nieve no cayó.",
    body: "El silencio ocupó su lugar. Ingrid escucha tres señales bajo el hielo y ninguna orden sobre el trono.",
    objective: "Leé las tres runas de la costa",
  },
  coast: {
    chapter: "ACTO I · LA PRUEBA DE NAUTHIZ",
    title: "La costa ya eligió su momento.",
    body: "Una sombra llega con las mareas. La bengala está al norte; el hörgr espera detrás de la muralla.",
    objective: "Resistí a los saqueadores y alcanzá la bengala",
  },
  ritual: {
    chapter: "ACTO II · EL HÖRGR",
    title: "La necesidad no pide permiso.",
    body: "Isa guarda una verdad. Nauthiz la fuerza. Perthro abre el paso que el clan todavía no se atreve a mirar.",
    objective: "Sostené la lectura dentro del hörgr",
  },
  victory: {
    chapter: "ACTO III · EL CONSEJO DE TRES",
    title: "El secreto no es un hombre.",
    body: "Es un clan que aprende a luchar como uno solo. El hilo no decide por Bjørndal: muestra dónde sostenerlo.",
    objective: "La lectura continúa",
  },
  defeat: {
    chapter: "HAGALAZ · LECTURA INTERRUMPIDA",
    title: "La lectura debe comenzar de nuevo.",
    body: "La necesidad no perdona una lectura incompleta. Volvé a tejer el hilo antes de que el fiordo cierre sus puertas.",
    objective: "Reintentá la defensa",
  },
} as const;

export type GameSnapshot = {
  phase: "coast" | "ritual" | "victory" | "defeat";
  hp: number;
  maxHp: number;
  seidr: number;
  maxSeidr: number;
  enemies: number;
  fragments: number;
  runesRead: RuneId[];
  cooldowns: Record<RuneId, number>;
  objective: string;
  message: string;
  messageSpeaker: string;
  support: "bjorn" | "hakon" | "astrid" | null;
  seconds: number;
};

export const INITIAL_SNAPSHOT: GameSnapshot = {
  phase: "coast",
  hp: 180,
  maxHp: 180,
  seidr: 100,
  maxSeidr: 100,
  enemies: 5,
  fragments: 0,
  runesRead: [],
  cooldowns: { urd: 0, isa: 0, nauthiz: 0, perthro: 0 },
  objective: NARRATIVE_BEATS.opening.objective,
  message: "Tres señales. Una pregunta. Ninguna orden.",
  messageSpeaker: "Ingrid",
  support: null,
  seconds: 0,
};

export const SUPPORTS = [
  { id: "bjorn" as const, glyph: "ᚢ", name: "Puño de Björn", role: "fuerza", description: "Aturde al frente y compra tiempo." },
  { id: "hakon" as const, glyph: "ᚨ", name: "Ojo de Hakon", role: "estrategia", description: "Revela la amenaza más próxima." },
  { id: "astrid" as const, glyph: "ᛟ", name: "Corazón de Astrid", role: "hogar", description: "Devuelve vigor a la lectura." },
];
