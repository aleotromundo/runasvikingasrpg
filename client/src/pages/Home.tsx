// Dirección visual: Amber War Room — editorial nórdico, asimetría de sala de guerra, ámbar para acción, carmine para peligro y espacio central despejado.

import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Flame, RotateCcw, Shield, Sparkles, Target, X } from "lucide-react";
import { GameCanvas } from "@/components/GameCanvas";
import { INITIAL_SNAPSHOT, NARRATIVE_BEATS, RUNE_ABILITIES, SUPPORTS, type GameSnapshot } from "@/game/data";
import { RpgGame } from "@/game/scene";

const MARK_URL = "/manus-storage/runa-three-thread-mark_71f4bcde.png";
const INGRID_URL = "/manus-storage/runa-ingrid-portrait_5c14a265.jpg";
const HERO_URL = "/manus-storage/runa-fiord-reference_cae98d92.jpg";
const ULF_URL = "/manus-storage/runa-ulf-portrait_e2103501.jpg";

function formatCooldown(value: number) {
  return value > 0 ? `${value.toFixed(1)} s` : "LISTA";
}

export default function Home() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [game, setGame] = useState<RpgGame | null>(null);
  const [started, setStarted] = useState(() => new URLSearchParams(window.location.search).has("demo"));
  const [codexOpen, setCodexOpen] = useState(false);
  const gameRef = useRef<RpgGame | null>(null);
  const onUpdate = useCallback((next: GameSnapshot) => setSnapshot(next), []);
  const onReady = useCallback((ready: RpgGame) => { gameRef.current = ready; setGame(ready); }, []);

  const beat = NARRATIVE_BEATS[snapshot.phase === "coast" ? "coast" : snapshot.phase];
  const readProgress = useMemo(() => `${snapshot.runesRead.length}/3`, [snapshot.runesRead.length]);
  const startGame = () => setStarted(true);
  const reset = () => { game?.reset(); setStarted(true); };

  return (
    <main className="rpg-shell">
      <GameCanvas onUpdate={onUpdate} onReady={onReady} />
      <div className="scene-grain" aria-hidden="true" />
      <div className="scene-vignette" aria-hidden="true" />

      <header className="rpg-topbar">
        <div className="brand-lockup">
          <img src={MARK_URL} alt="Sello de las Nornas" className="brand-mark" />
          <div>
            <p className="eyebrow">LA PRUEBA DE NAUTHIZ · ACTO I</p>
            <h1>El Hilo de las Nornas</h1>
          </div>
        </div>
        <button className="codex-button" onClick={() => setCodexOpen(true)} aria-label="Abrir códice">
          <BookOpen size={14} /> <span>CÓDICE</span>
        </button>
      </header>

      <aside className="quest-rail">
        <div className="rail-kicker"><Target size={13} /> OBJETIVO ACTUAL</div>
        <h2>{snapshot.objective}</h2>
        <div className="quest-meta"><span>ᛟ {snapshot.fragments} fragmentos</span><span>ᛉ {snapshot.enemies} amenazas</span></div>
      </aside>

      <section className="narrative-chip" aria-live="polite">
        <div className="chip-label">{snapshot.messageSpeaker}</div>
        <p>“{snapshot.message}”</p>
        <span className="chip-line" />
      </section>

      <section className="player-card hud-panel">
        <img src={INGRID_URL} alt="Ingrid, völva de Bjørndal" />
        <div className="player-card-body">
          <div className="player-name"><strong>Ingrid</strong><span>VÖLVA DE BJØRNDAL</span></div>
          <div className="resource-row"><span>VIDA</span><div className="bar"><i className="bar-hp" style={{ width: `${(snapshot.hp / snapshot.maxHp) * 100}%` }} /></div><b>{Math.ceil(snapshot.hp)}</b></div>
          <div className="resource-row"><span>SEIÐR</span><div className="bar"><i className="bar-seidr" style={{ width: `${(snapshot.seidr / snapshot.maxSeidr) * 100}%` }} /></div><b>{Math.ceil(snapshot.seidr)}</b></div>
        </div>
      </section>

      <div className="status-runes" aria-label="Runas leídas">
        <span className={snapshot.runesRead.includes("isa") ? "read" : ""}>ᛁ</span>
        <span className={snapshot.runesRead.includes("nauthiz") ? "read" : ""}>ᚾ</span>
        <span className={snapshot.runesRead.includes("perthro") ? "read" : ""}>ᛈ</span>
        <small>LECTURA {readProgress}</small>
      </div>

      <section className="support-panel hud-panel">
        <div className="panel-kicker">CONSEJO DE TRES</div>
        <div className="support-grid">
          {SUPPORTS.map((support) => (
            <button key={support.id} className={`support-button ${snapshot.support === support.id ? "selected" : ""}`} onClick={() => game?.chooseSupport(support.id)}>
              <span className="support-glyph">{support.glyph}</span>
              <span><b>{support.name}</b><small>{support.role}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="spellbar" aria-label="Habilidades rúnicas">
        {RUNE_ABILITIES.map((rune) => (
          <button key={rune.id} className={`spell-card spell-${rune.color}`} onClick={() => game?.cast(rune.id)} disabled={snapshot.cooldowns[rune.id] > 0 || snapshot.seidr < rune.cost}>
            <span className="spell-key">{rune.key}</span>
            <span className="spell-glyph">{rune.glyph}</span>
            <span className="spell-copy"><b>{rune.name}</b><small>{rune.effect}</small></span>
            <span className="spell-cooldown">{formatCooldown(snapshot.cooldowns[rune.id])}</span>
          </button>
        ))}
      </section>

      <div className="touch-move" aria-label="Controles táctiles de movimiento">
        <button onClick={() => game?.move(0, -1)}><ArrowUp size={16} /></button>
        <button onClick={() => game?.move(-1, 0)}><ArrowLeft size={16} /></button>
        <button onClick={() => game?.move(0, 1)}><ArrowDown size={16} /></button>
        <button onClick={() => game?.move(1, 0)}><ArrowRight size={16} /></button>
      </div>
      <div className="touch-spells">
        {RUNE_ABILITIES.map((rune) => <button key={rune.id} onClick={() => game?.cast(rune.id)} disabled={snapshot.cooldowns[rune.id] > 0}>{rune.key}</button>)}
      </div>

      {!started && (
        <section className="threshold-screen">
          <div className="threshold-image" style={{ backgroundImage: `url(${HERO_URL})` }} />
          <div className="threshold-copy">
            <img src={MARK_URL} alt="" className="threshold-mark" />
            <p className="eyebrow">CAPÍTULOS I–XIII · LA SAGA COBRA VIDA</p>
            <h2>El secreto no<br />es un hombre.</h2>
            <p className="threshold-deck">Es un clan que aprende a luchar como uno solo.</p>
            <button className="amber-cta" onClick={startGame}>DEFENDER BJØRNDAL <ArrowRight size={16} /></button>
            <small className="control-note">PC: WASD + 1–4 · MÓVIL: runas y pad táctil</small>
          </div>
        </section>
      )}

      {codexOpen && (
        <section className="codex-overlay" role="dialog" aria-modal="true" aria-labelledby="codex-title">
          <div className="codex-sheet">
            <button className="close-button" onClick={() => setCodexOpen(false)} aria-label="Cerrar códice"><X size={18} /></button>
            <div className="codex-header"><img src={MARK_URL} alt="" /><div><p className="eyebrow">MEMORIA DE PRODUCCIÓN</p><h2 id="codex-title">La lectura de Ingrid</h2></div></div>
            <p>Cuando murió Agnar, la nieve no cayó. El silencio ocupó su lugar. La costa conserva tres señales y el hörgr guarda la pregunta que nadie quiere formular.</p>
            <div className="codex-columns"><div><span>ISA</span><b>Conservar</b><small>El hielo puede proteger una verdad.</small></div><div><span>NAUTHIZ</span><b>Forzar</b><small>La necesidad obliga al clan a actuar.</small></div><div><span>PERTHRO</span><b>Abrir</b><small>El paso aparece cuando se lo mira de frente.</small></div></div>
            <p className="codex-foot"><Flame size={14} /> Base narrativa: `runasvikingasrpg` · versión web reconstruida con Babylon.js</p>
          </div>
        </section>
      )}

      {(snapshot.phase === "defeat" || snapshot.phase === "victory") && (
        <section className={`result-overlay ${snapshot.phase}`} role="dialog" aria-modal="true">
          <div className="result-sheet">
            <img src={snapshot.phase === "victory" ? MARK_URL : ULF_URL} alt="" className="result-art" />
            <div className="result-copy"><p className="eyebrow">{beat.chapter}</p><h2>{beat.title}</h2><p>{beat.body}</p><button className="amber-cta" onClick={reset}><RotateCcw size={15} /> {snapshot.phase === "victory" ? "VOLVER A LEER" : "VOLVER AL FIORDO"}</button></div>
          </div>
        </section>
      )}

      <footer className="rpg-footer"><span><Sparkles size={12} /> {beat.chapter}</span><span>R para reiniciar · {Math.floor(snapshot.seconds)}s</span></footer>
    </main>
  );
}
