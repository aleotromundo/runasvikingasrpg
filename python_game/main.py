"""El Hilo de las Nornas — primer prototipo real.

Ejecutar localmente con: python main.py
Empaquetado web previsto con Pygbag: pygbag --template basic .
"""
from __future__ import annotations

import asyncio
import math
import sys
from dataclasses import dataclass
from typing import Iterable

import pygame

WIDTH, HEIGHT = 960, 600
FPS = 60
BG = (13, 19, 23)
INK = (239, 231, 211)
MUTED = (164, 176, 168)
TEAL = (116, 212, 199)
EMBER = (207, 103, 69)
OCHRE = (209, 161, 91)
STONE = (46, 57, 59)


@dataclass
class RuneStone:
    name: str
    glyph: str
    whisper: str
    rect: pygame.Rect
    read: bool = False


@dataclass
class Actor:
    rect: pygame.Rect
    speed: float
    color: tuple[int, int, int]
    facing: pygame.Vector2
    health: int = 3


class Game:
    def __init__(self) -> None:
        pygame.init()
        pygame.display.set_caption("El Hilo de las Nornas — Prototipo real")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 22)
        self.small = pygame.font.Font(None, 16)
        self.display = pygame.font.Font(None, 30)
        self.title = pygame.font.Font(None, 64)
        self.glyph = pygame.font.Font(None, 56)
        self.running = True
        self.mode = "prologue"
        self.prologue_page = 0
        self.log = "El fuego ha dejado de crujir."
        self.active_rune = ""
        self.fade = 0
        self.player = Actor(pygame.Rect(450, 390, 22, 22), 185.0, EMBER, pygame.Vector2(0, -1))
        self.enemy = Actor(pygame.Rect(720, 190, 28, 28), 74.0, (139, 58, 49), pygame.Vector2(-1, 0), 2)
        self.runes: list[RuneStone] = [
            RuneStone("ISA", "ᛁ", "Lo que se detiene", pygame.Rect(274, 155, 64, 64)),
            RuneStone("NAUTHIZ", "ᚾ", "La presión que obliga", pygame.Rect(448, 120, 64, 64)),
            RuneStone("PERTHRO", "ᛈ", "Lo que aún no se ve", pygame.Rect(622, 155, 64, 64)),
        ]
        self.obstacles = [
            pygame.Rect(160, 88, 640, 24),
            pygame.Rect(160, 88, 24, 390),
            pygame.Rect(776, 88, 24, 390),
            pygame.Rect(160, 454, 640, 24),
            pygame.Rect(340, 270, 110, 28),
            pygame.Rect(556, 330, 132, 25),
        ]
        self.keys: set[int] = set()
        self.time = 0.0
        self.attack_timer = 0.0
        self.invulnerability = 0.0
        self.won = False
        self.lost = False

    def text(self, value: str, position: tuple[int, int], color=INK, font=None) -> None:
        surface = (font or self.font).render(value, True, color)
        self.screen.blit(surface, position)

    def wrapped(self, value: str, rect: pygame.Rect, color=INK, font=None, line_gap=5) -> None:
        words = value.split()
        lines: list[str] = []
        line = ""
        active_font = font or self.font
        for word in words:
            trial = f"{line} {word}".strip()
            if active_font.size(trial)[0] > rect.width and line:
                lines.append(line)
                line = word
            else:
                line = trial
        if line:
            lines.append(line)
        for index, content in enumerate(lines):
            self.text(content, (rect.x, rect.y + index * (active_font.get_height() + line_gap)), color, active_font)

    def panel(self, rect: pygame.Rect, fill=(20, 29, 32), border=(100, 124, 119)) -> None:
        pygame.draw.rect(self.screen, fill, rect)
        pygame.draw.rect(self.screen, border, rect, 1)
        pygame.draw.line(self.screen, OCHRE, rect.topleft, (rect.left + 38, rect.top), 2)

    def events(self) -> None:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                self.keys.add(event.key)
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                if event.key in (pygame.K_SPACE, pygame.K_RETURN):
                    self.advance()
                if event.key == pygame.K_r and self.mode == "coast":
                    self.reset_coast()
            elif event.type == pygame.KEYUP:
                self.keys.discard(event.key)

    def advance(self) -> None:
        if self.mode == "prologue":
            self.prologue_page += 1
            if self.prologue_page > 2:
                self.mode = "ritual"
        elif self.mode == "ritual":
            for rune in self.runes:
                if rune.rect.inflate(34, 34).colliderect(self.player.rect):
                    rune.read = True
                    self.active_rune = rune.name
                    self.log = f"{rune.name}: {rune.whisper}. El hilo recuerda una salida compartida."
            if all(rune.read for rune in self.runes):
                self.mode = "coast"
                self.player.rect.topleft = (205, 392)
                self.log = "La tercera señal se apaga. Algo se mueve en la costa."
        elif self.mode == "coast" and (self.won or self.lost):
            self.reset_coast()

    def collides(self, rect: pygame.Rect) -> bool:
        return any(rect.colliderect(obstacle) for obstacle in self.obstacles)

    def move_player(self, dt: float) -> None:
        directions = pygame.Vector2(0, 0)
        if pygame.K_w in self.keys or pygame.K_UP in self.keys:
            directions.y -= 1
        if pygame.K_s in self.keys or pygame.K_DOWN in self.keys:
            directions.y += 1
        if pygame.K_a in self.keys or pygame.K_LEFT in self.keys:
            directions.x -= 1
        if pygame.K_d in self.keys or pygame.K_RIGHT in self.keys:
            directions.x += 1
        if not directions.length_squared():
            return
        directions = directions.normalize()
        self.player.facing = directions
        delta = directions * self.player.speed * dt
        horizontal = self.player.rect.move(round(delta.x), 0)
        if not self.collides(horizontal):
            self.player.rect = horizontal
        vertical = self.player.rect.move(0, round(delta.y))
        if not self.collides(vertical):
            self.player.rect = vertical

    def update(self, dt: float) -> None:
        self.time += dt
        if self.mode == "ritual":
            self.move_player(dt)
        elif self.mode == "coast" and not self.won and not self.lost:
            self.move_player(dt)
            self.attack_timer += dt
            self.invulnerability = max(0.0, self.invulnerability - dt)
            target = pygame.Vector2(self.player.rect.center)
            origin = pygame.Vector2(self.enemy.rect.center)
            distance = target.distance_to(origin)
            if distance < 170:
                if distance > 54:
                    chase = (target - origin).normalize()
                    next_rect = self.enemy.rect.move(round(chase.x * self.enemy.speed * dt), round(chase.y * self.enemy.speed * dt))
                    if not self.collides(next_rect):
                        self.enemy.rect = next_rect
                if self.attack_timer > 1.45:
                    self.attack_timer = 0.0
                    if distance < 78 and self.invulnerability <= 0:
                        self.player.health -= 1
                        self.invulnerability = 0.75
                        self.log = "La sombra golpea. Separarse también es una forma de vencer."
                        if self.player.health <= 0:
                            self.lost = True
            if self.player.rect.colliderect(pygame.Rect(690, 120, 60, 54)):
                self.won = True
                self.log = "La bengala arde. El consejo verá la costa antes del amanecer."

    def reset_coast(self) -> None:
        self.player.rect.topleft = (205, 392)
        self.player.health = 3
        self.enemy.rect.topleft = (720, 190)
        self.attack_timer = 0
        self.invulnerability = 0
        self.won = False
        self.lost = False
        self.log = "Llegá a la bengala antes de que la costa se cierre."

    def draw_header(self, chapter: str) -> None:
        self.text("RUNAS VIKINGAS", (42, 26), INK, self.display)
        self.text("EL HILO DE LAS NORNAS", (44, 58), TEAL, self.small)
        self.text(chapter, (WIDTH - 235, 34), MUTED, self.small)
        pygame.draw.line(self.screen, (57, 75, 75), (40, 82), (WIDTH - 40, 82), 1)

    def draw_prologue(self) -> None:
        self.screen.fill(BG)
        self.draw_header("PRÓLOGO · LA PIRA")
        for i in range(18):
            x = 130 + i * 42
            height = 20 + int(abs(math.sin(self.time * 3 + i)) * 28)
            pygame.draw.line(self.screen, (100, 49, 31), (x, 476), (x, 476 - height), 3)
            pygame.draw.circle(self.screen, (226, 137, 60), (x, 474 - height), 4)
        pygame.draw.circle(self.screen, (111, 67, 42), (480, 474), 92, 4)
        panel = pygame.Rect(92, 118, 776, 276)
        self.panel(panel, (20, 27, 30), (121, 148, 140))
        pages = [
            ("Cuando murió Agnar", "la nieve no cayó. El silencio ocupó su lugar. En Bjørndal, dos nombres comenzaron a pesar más que los demás: Björn y Hakon."),
            ("Ingrid abrió la mano", "y dejó tres piedras sobre la madera. Isa. Nauthiz. Perthro. Ninguna respondió con una orden. Juntas formaron una pregunta."),
            ("Desde la costa llegó un sonido", "demasiado regular para ser una ola. La sala larga seguía discutiendo el trono. El mar ya había elegido su momento."),
        ]
        heading, body = pages[self.prologue_page]
        self.text(heading, (132, 158), OCHRE, self.title)
        self.wrapped(body, pygame.Rect(136, 246, 650, 80), INK, self.display, 9)
        self.text("ESPACIO / ENTER · continuar", (132, 356), TEAL, self.small)

    def draw_ritual(self) -> None:
        self.screen.fill((16, 24, 26))
        self.draw_header("CAPÍTULO 01 · EL HÖRGR")
        pygame.draw.rect(self.screen, (34, 38, 35), (120, 110, 720, 385))
        pygame.draw.rect(self.screen, (83, 71, 52), (120, 110, 720, 385), 2)
        pygame.draw.circle(self.screen, (83, 51, 33), (480, 374), 86)
        pygame.draw.circle(self.screen, (209, 125, 51), (480, 358), 32)
        pygame.draw.circle(self.screen, (252, 177, 72), (480, 349), 12)
        for rune in self.runes:
            fill = (33, 70, 70) if rune.read else STONE
            border = TEAL if rune.read else (112, 117, 102)
            pygame.draw.rect(self.screen, fill, rune.rect)
            pygame.draw.rect(self.screen, border, rune.rect, 2)
            glyph = self.glyph.render(rune.glyph, True, INK)
            self.screen.blit(glyph, (rune.rect.centerx - glyph.get_width() // 2, rune.rect.y + 1))
            self.text(rune.name, (rune.rect.x - 3, rune.rect.bottom + 8), TEAL if rune.read else MUTED, self.small)
        pygame.draw.rect(self.screen, self.player.color, self.player.rect)
        pygame.draw.rect(self.screen, INK, self.player.rect, 2)
        self.text("INgrid · mover", (self.player.rect.x - 20, self.player.rect.bottom + 8), INK, self.small)
        self.panel(pygame.Rect(32, 112, 70, 330), (21, 29, 31), (80, 108, 103))
        self.text("EL", (54, 144), OCHRE, self.small)
        self.text("HILO", (46, 164), OCHRE, self.small)
        self.wrapped(self.log, pygame.Rect(32, 470, 680, 40), MUTED, self.font)
        self.text("Acercate a cada piedra · ESPACIO / ENTER para leer", (590, 532), TEAL, self.small)

    def draw_coast(self) -> None:
        self.screen.fill((10, 23, 28))
        self.draw_header("CAPÍTULO 01 · LA COSTA")
        pygame.draw.rect(self.screen, (22, 48, 52), (70, 105, 730, 410))
        for x in range(85, 790, 25):
            y = 127 + int(math.sin(x * 0.08 + self.time) * 6)
            pygame.draw.line(self.screen, (42, 79, 79), (x, y), (x + 16, y), 1)
        for obstacle in self.obstacles:
            pygame.draw.rect(self.screen, (57, 45, 32), obstacle)
            pygame.draw.rect(self.screen, (121, 95, 59), obstacle, 1)
        pygame.draw.rect(self.screen, (43, 72, 72), (690, 120, 60, 54), 2)
        pygame.draw.circle(self.screen, OCHRE, (720, 147), 9)
        pygame.draw.circle(self.screen, EMBER, (720, 147), 18, 2)
        distance = self.player.rect.centerx - self.enemy.rect.centerx
        if abs(distance) < 170:
            pygame.draw.circle(self.screen, EMBER, self.enemy.rect.center, 52, 2)
        pygame.draw.rect(self.screen, self.enemy.color, self.enemy.rect)
        pygame.draw.line(self.screen, OCHRE, self.enemy.rect.topleft, self.enemy.rect.bottomright, 3)
        pygame.draw.line(self.screen, OCHRE, self.enemy.rect.topright, self.enemy.rect.bottomleft, 3)
        if self.invulnerability <= 0 or int(self.time * 12) % 2:
            pygame.draw.rect(self.screen, self.player.color, self.player.rect)
            pygame.draw.rect(self.screen, INK, self.player.rect, 2)
        side = pygame.Rect(820, 105, 108, 410)
        self.panel(side, (21, 29, 31), (80, 108, 103))
        self.text("VIGOR", (842, 140), MUTED, self.small)
        for index in range(3):
            pygame.draw.rect(self.screen, EMBER if index < self.player.health else (62, 38, 34), (842, 160 + index * 18, 64, 9))
        self.text("RUMBO", (842, 244), MUTED, self.small)
        self.text("BENGALA", (837, 266), TEAL, self.small)
        self.wrapped(self.log, pygame.Rect(842, 325, 74, 110), INK, self.small, 3)
        self.text("WASD", (92, 542), OCHRE, self.small)
        self.text("mover", (143, 542), MUTED, self.small)
        self.text("ESC", (220, 542), OCHRE, self.small)
        self.text("salir", (255, 542), MUTED, self.small)
        if self.won or self.lost:
            veil = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            veil.fill((5, 10, 12, 190))
            self.screen.blit(veil, (0, 0))
            title = "LA SEÑAL LLEGÓ" if self.won else "LA MAREA TE VENCIÓ"
            self.text(title, (280, 230), OCHRE if self.won else EMBER, self.title)
            self.text("ESPACIO / ENTER · volver a intentar", (340, 315), TEAL, self.font)

    def draw(self) -> None:
        if self.mode == "prologue":
            self.draw_prologue()
        elif self.mode == "ritual":
            self.draw_ritual()
        else:
            self.draw_coast()
        pygame.display.flip()

    async def run(self) -> None:
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0
            self.events()
            self.update(dt)
            self.draw()
            await asyncio.sleep(0)
        pygame.quit()


def main() -> None:
    asyncio.run(Game().run())


if __name__ == "__main__":
    main()
