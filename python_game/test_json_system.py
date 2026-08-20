from pathlib import Path

from engine import EventLoader, EventSystem, GameState, MapLoader

ROOT = Path(__file__).parent

maps = MapLoader(ROOT / "data" / "maps")
horgr = maps.load("horgr")
coast = maps.load("coast")
assert horgr.map_id == "horgr"
assert coast.map_id == "coast"
assert len(horgr.entities) == 4
assert len(horgr.transfers) == 1

transfer_by_id = {item.transfer_id: item for item in horgr.transfers}
state = GameState(current_map="horgr", player_x=450, player_y=390)
events = EventLoader(ROOT / "data" / "events").load_file("act_01.json")
system = EventSystem(state, transfer_by_id.get)

for event_id in ("read_isa", "read_nauthiz", "read_perthro"):
    result = system.run(events[event_id])
    assert result.consumed

assert state.runes_read == {"ISA", "NAUTHIZ", "PERTHRO"}
assert "three_runes_read" in state.flags
print("json_system_ok", horgr.title, coast.title, sorted(state.runes_read))
