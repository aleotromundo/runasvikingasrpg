// Dirección visual: Amber War Room — el canvas ocupa el campo de batalla; React queda en los bordes como instrumentación, nunca como obstáculo central.

import { useEffect, useRef } from "react";
import { RpgGame } from "@/game/scene";
import type { GameSnapshot, RuneId } from "@/game/data";

type GameCanvasProps = {
  onUpdate: (snapshot: GameSnapshot) => void;
  onReady: (game: RpgGame) => void;
};

export function GameCanvas({ onUpdate, onReady }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<RpgGame | null>(null);

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;
    const game = new RpgGame(onUpdate);
    gameRef.current = game;
    game.start(canvasRef.current);
    onReady(game);
    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, [onReady, onUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="Arena 3D de la defensa de Bjørndal"
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

export type GameActions = {
  move: (dx: number, dz: number) => void;
  cast: (id: RuneId) => void;
};
