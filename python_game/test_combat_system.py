from pathlib import Path

from engine.combat_system import CombatSystem

ROOT = Path(__file__).parent
combat = CombatSystem(ROOT / "data" / "combat")
combat.start("coast_shadow")
assert combat.active_actor is not None
assert combat.active_actor.combatant_id == "ingrid"

first = combat.execute("ability:isa_guard", target_id="coast_shadow")
assert first.amount > 0
assert combat.combatants["coast_shadow"].has_status("slowed")

# La sombra actúa; la defensa reduce el siguiente daño recibido.
combat.execute("attack", target_id="ingrid")
health_before = combat.combatants["ingrid"].hp
combat.execute("defend")
combat.execute("attack", target_id="ingrid")
assert combat.combatants["ingrid"].hp <= health_before

# Resolver el encuentro de forma determinista hasta comprobar la condición de victoria.
while combat.phase == "active":
    actor = combat.active_actor
    if actor is None:
        break
    if actor.team == "heroes":
        target = "coast_shadow"
        action = "attack"
        if actor.mana >= 4 and combat.combatants[target].hp > 20:
            action = "ability:perthro_fate"
        combat.execute(action, target_id=target)
    else:
        combat.execute("attack", target_id="ingrid")

assert combat.phase == "won"
print("combat_system_ok", combat.round, combat.phase, combat.log[-1])
