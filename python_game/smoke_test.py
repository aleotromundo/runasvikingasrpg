import os
os.environ["SDL_VIDEODRIVER"] = "dummy"
import pygame
from main import Game

pygame.init()
game = Game()
for _ in range(8):
    game.events()
    game.update(1 / 60)
    game.draw()
game.running = False
pygame.quit()
print("smoke_ok", game.mode, game.player.rect.topleft)
