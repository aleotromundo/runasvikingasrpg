// Dirección visual: Amber War Room — cámara 3/4 legible, materiales nórdicos oscuros, luz ámbar funcional y siluetas que se leen antes que el detalle.

import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Engine,
  GlowLayer,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { INITIAL_SNAPSHOT, NARRATIVE_BEATS, RUNE_ABILITIES, SUPPORTS, type GameSnapshot, type RuneId } from "./data";

type SnapshotListener = (snapshot: GameSnapshot) => void;

type Enemy = { root: TransformNode; hp: number; nextHit: number; stunnedUntil: number; seed: number };

const COLORS = {
  night: new Color3(0.018, 0.032, 0.06),
  water: new Color3(0.025, 0.09, 0.13),
  slate: new Color3(0.11, 0.14, 0.17),
  stone: new Color3(0.2, 0.22, 0.23),
  wood: new Color3(0.18, 0.095, 0.05),
  amber: new Color3(0.9, 0.52, 0.13),
  ice: new Color3(0.22, 0.67, 0.95),
  carmine: new Color3(0.72, 0.12, 0.13),
  bone: new Color3(0.73, 0.68, 0.54),
};

const runePositions: Record<Exclude<RuneId, "urd">, Vector3> = {
  isa: new Vector3(-4.5, 0.18, 1.8),
  nauthiz: new Vector3(0, 0.18, 3.5),
  perthro: new Vector3(4.5, 0.18, 1.8),
};

function material(scene: Scene, name: string, color: Color3, emissive?: Color3) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissive) {
    mat.emissiveColor = emissive;
  }
  return mat;
}

function box(scene: Scene, name: string, size: { width: number; height: number; depth: number }, position: Vector3, mat: StandardMaterial) {
  const mesh = MeshBuilder.CreateBox(name, size, scene);
  mesh.position = position;
  mesh.material = mat;
  return mesh;
}

function createLabel(scene: Scene, text: string, position: Vector3, color: string) {
  const texture = new DynamicTexture(`label-${text}`, { width: 512, height: 128 }, scene, true);
  texture.hasAlpha = true;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = "bold 34px Arial";
  ctx.fillStyle = color;
  (ctx as CanvasRenderingContext2D).textAlign = "center";
  ctx.fillText(text, 256, 76);
  const label = MeshBuilder.CreatePlane(`label-plane-${text}`, { width: 3.2, height: 0.8 }, scene);
  label.position = position;
  label.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const mat = new StandardMaterial(`label-mat-${text}`, scene);
  mat.diffuseTexture = texture;
  mat.opacityTexture = texture;
  mat.emissiveColor = new Color3(0.7, 0.7, 0.7);
  mat.backFaceCulling = false;
  label.material = mat;
  return label;
}

function createCharacter(scene: Scene, name: string, position: Vector3, accent: Color3, enemy = false) {
  const root = new TransformNode(name, scene);
  root.position = position.clone();
  const bodyMat = material(scene, `${name}-body`, enemy ? new Color3(0.08, 0.055, 0.055) : new Color3(0.16, 0.18, 0.2));
  const accentMat = material(scene, `${name}-accent`, accent, enemy ? accent.scale(0.38) : accent.scale(0.2));
  const skinMat = material(scene, `${name}-skin`, new Color3(0.45, 0.31, 0.22));

  const cloak = MeshBuilder.CreateCylinder(`${name}-cloak`, { height: enemy ? 1.7 : 1.95, diameterTop: enemy ? 0.36 : 0.42, diameterBottom: enemy ? 1.15 : 1.25, tessellation: 6 }, scene);
  cloak.position.y = 0.96;
  cloak.material = bodyMat;
  cloak.parent = root;

  const torso = box(scene, `${name}-torso`, { width: 0.55, height: 0.75, depth: 0.42 }, new Vector3(0, 1.7, 0), bodyMat);
  torso.parent = root;
  const head = MeshBuilder.CreateSphere(`${name}-head`, { diameter: 0.45, segments: 8 }, scene);
  head.position = new Vector3(0, 2.22, 0);
  head.material = skinMat;
  head.parent = root;

  const shoulder = box(scene, `${name}-shoulder`, { width: enemy ? 0.96 : 1.12, height: 0.2, depth: 0.56 }, new Vector3(0, 1.9, 0), accentMat);
  shoulder.parent = root;
  const feet = box(scene, `${name}-shadow`, { width: 1.1, height: 0.04, depth: 0.72 }, new Vector3(0, 0.04, 0), material(scene, `${name}-shadowmat`, new Color3(0.01, 0.012, 0.018)));
  feet.parent = root;

  const weapon = box(scene, `${name}-weapon`, { width: enemy ? 0.08 : 0.1, height: enemy ? 1.35 : 1.5, depth: 0.08 }, new Vector3(enemy ? 0.52 : 0.5, 1.13, 0.02), accentMat);
  weapon.rotation.z = enemy ? -0.22 : 0.14;
  weapon.parent = root;

  if (!enemy) {
    const hood = MeshBuilder.CreateCylinder(`${name}-hood`, { height: 0.34, diameterTop: 0.12, diameterBottom: 0.68, tessellation: 6 }, scene);
    hood.position = new Vector3(0, 2.32, 0);
    hood.material = bodyMat;
    hood.parent = root;
    const rune = MeshBuilder.CreateTorus(`${name}-rune`, { diameter: 0.24, thickness: 0.035, tessellation: 16 }, scene);
    rune.position = new Vector3(0, 1.84, -0.29);
    rune.rotation.x = Math.PI / 2;
    rune.material = accentMat;
    rune.parent = root;
  }
  return root;
}

export class RpgGame {
  private engine?: Engine;
  private scene?: Scene;
  private camera?: ArcRotateCamera;
  private canvas?: HTMLCanvasElement;
  private player?: TransformNode;
  private enemies: Enemy[] = [];
  private runeMeshes: Partial<Record<RuneId, Mesh>> = {};
  private fire?: PointLight;
  private lastTime = 0;
  private elapsed = 0;
  private onUpdate: SnapshotListener;
  private keys = new Set<string>();
  private disposed = false;
  private demo = false;
  private demoStep = 0;
  private snapshot: GameSnapshot = structuredClone(INITIAL_SNAPSHOT);

  constructor(onUpdate: SnapshotListener) {
    this.onUpdate = onUpdate;
  }

  start(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.demo = new URLSearchParams(window.location.search).has("demo");
    this.engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false, adaptToDeviceRatio: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.018, 0.03, 0.06, 1);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.025;
    this.scene.fogColor = COLORS.night;

    const camera = new ArcRotateCamera("rpg-camera", -Math.PI / 2, 1.04, 23, new Vector3(0, 0, 0), this.scene);
    camera.lowerRadiusLimit = 18;
    camera.upperRadiusLimit = 26;
    camera.wheelPrecision = 80;
    camera.inputs.clear();
    this.camera = camera;

    const hemi = new HemisphericLight("winter-sky", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.5;
    hemi.diffuse = new Color3(0.22, 0.34, 0.54);
    hemi.groundColor = new Color3(0.03, 0.035, 0.05);
    const moon = new DirectionalLight("moonlight", new Vector3(-0.35, -1, 0.4), this.scene);
    moon.intensity = 0.82;
    moon.diffuse = new Color3(0.44, 0.56, 0.77);
    this.fire = new PointLight("signal-fire", new Vector3(0, 2.2, -6.4), this.scene);
    this.fire.diffuse = COLORS.amber;
    this.fire.intensity = 4.2;
    this.fire.range = 8;

    const glow = new GlowLayer("rune-glow", this.scene);
    glow.intensity = 0.55;
    this.buildWorld();
    this.bindInput();
    this.lastTime = performance.now();
    this.engine.runRenderLoop(() => {
      if (this.disposed || !this.scene) return;
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.tick(dt);
      this.scene.render();
    });
    this.onUpdate(this.snapshot);
  }

  private buildWorld() {
    const scene = this.scene;
    if (!scene) return;
    const waterMat = material(scene, "fjord-water", COLORS.water, new Color3(0.01, 0.045, 0.065));
    const shoreMat = material(scene, "black-pebble-shore", new Color3(0.08, 0.095, 0.11));
    const woodMat = material(scene, "wet-timber", COLORS.wood);
    const roofMat = material(scene, "tarred-roof", new Color3(0.045, 0.05, 0.055));
    const stoneMat = material(scene, "ritual-stone", COLORS.stone);
    const amberMat = material(scene, "amber-runes", COLORS.amber, COLORS.amber.scale(0.9));
    const redMat = material(scene, "warning-runes", COLORS.carmine, COLORS.carmine.scale(0.75));

    const water = box(scene, "fjord", { width: 30, height: 0.14, depth: 5.5 }, new Vector3(0, -0.18, 7.3), waterMat);
    water.receiveShadows = true;
    const shore = MeshBuilder.CreateGround("shore", { width: 28, height: 16, subdivisions: 2 }, scene);
    shore.position.y = -0.12;
    shore.material = shoreMat;

    for (let i = 0; i < 10; i += 1) {
      const path = box(scene, `path-${i}`, { width: 0.35, height: 0.035, depth: 1.1 }, new Vector3(-5.2 + i * 1.15, 0.02, 4.2 - i * 0.6), i % 2 ? amberMat : redMat);
      path.rotation.y = -0.13;
    }

    const longhouse = new TransformNode("longhouse", scene);
    box(scene, "longhouse-wall", { width: 5.4, height: 2.2, depth: 2.6 }, new Vector3(-6, 1.05, 0.4), woodMat).parent = longhouse;
    const roof = MeshBuilder.CreateCylinder("longhouse-roof", { height: 2.9, diameter: 3.9, tessellation: 3 }, scene);
    roof.rotation.z = Math.PI / 2;
    roof.scaling.y = 0.75;
    roof.position = new Vector3(-6, 2.55, 0.4);
    roof.material = roofMat;
    roof.parent = longhouse;
    for (let x = -7.8; x <= -4.2; x += 0.55) box(scene, `longhouse-post-${x}`, { width: 0.09, height: 2.7, depth: 0.09 }, new Vector3(x, 1.25, -0.94), stoneMat);

    const hörgr = new TransformNode("horgr", scene);
    box(scene, "horgr-base", { width: 4.8, height: 0.72, depth: 3.8 }, new Vector3(6.4, 0.35, 0.9), stoneMat).parent = hörgr;
    const hörgrRoof = MeshBuilder.CreateCylinder("horgr-roof", { height: 4.4, diameter: 4.1, tessellation: 4 }, scene);
    hörgrRoof.rotation.y = Math.PI / 4;
    hörgrRoof.scaling.y = 0.58;
    hörgrRoof.position = new Vector3(6.4, 2.8, 0.9);
    hörgrRoof.material = roofMat;
    hörgrRoof.parent = hörgr;
    const altar = box(scene, "altar", { width: 1.5, height: 0.45, depth: 0.9 }, new Vector3(6.4, 0.75, 0.9), woodMat);
    const altarRune = MeshBuilder.CreateTorus("altar-rune", { diameter: 0.8, thickness: 0.08, tessellation: 6 }, scene);
    altarRune.position = new Vector3(6.4, 1.02, 0.9);
    altarRune.rotation.x = Math.PI / 2;
    altarRune.material = amberMat;

    for (const [id, pos] of Object.entries(runePositions) as [Exclude<RuneId, "urd">, Vector3][]) {
      const stone = MeshBuilder.CreateCylinder(`rune-${id}`, { height: 0.85, diameter: 0.62, tessellation: 6 }, scene);
      stone.position = pos;
      stone.material = stoneMat;
      const ring = MeshBuilder.CreateTorus(`rune-ring-${id}`, { diameter: 1.15, thickness: 0.06, tessellation: 16 }, scene);
      ring.position = new Vector3(pos.x, 0.12, pos.z);
      ring.rotation.x = Math.PI / 2;
      ring.material = id === "isa" ? material(scene, "ice-rune", COLORS.ice, COLORS.ice.scale(0.7)) : amberMat;
      this.runeMeshes[id] = ring;
      createLabel(scene, id === "isa" ? "ISA · DETENER" : id === "nauthiz" ? "NAUTHIZ · FORZAR" : "PERTHRO · ABRIR", new Vector3(pos.x, 1.25, pos.z), id === "isa" ? "#8bd8ff" : "#e8aa50");
    }

    const fireMesh = MeshBuilder.CreateCylinder("signal-fire-brazier", { height: 0.55, diameter: 0.8, tessellation: 8 }, scene);
    fireMesh.position = new Vector3(0, 0.26, -6.4);
    fireMesh.material = woodMat;
    const flame = MeshBuilder.CreateSphere("signal-flame", { diameter: 0.72, segments: 8 }, scene);
    flame.position = new Vector3(0, 0.86, -6.4);
    flame.scaling.y = 1.55;
    flame.material = amberMat;
    createLabel(scene, "BENGALA DE AGNAR", new Vector3(0, 1.75, -6.4), "#e8aa50");

    this.player = createCharacter(scene, "ingrid", new Vector3(0, 0, 5.2), COLORS.amber);
    createLabel(scene, "INGRID · VÖLVA", new Vector3(0, 3.2, 5.2), "#fff0cd");
    this.spawnEnemies();
  }

  private spawnEnemies() {
    const scene = this.scene;
    if (!scene) return;
    const positions = [new Vector3(-5.4, 0, -1.5), new Vector3(-2.9, 0, -0.7), new Vector3(2.8, 0, -0.7), new Vector3(5.4, 0, -1.5), new Vector3(0, 0, -2.8)];
    this.enemies = positions.map((position, index) => ({
      root: createCharacter(scene, `jarnsman-${index}`, position, index % 2 ? COLORS.carmine : new Color3(0.43, 0.12, 0.11), true),
      hp: 36,
      nextHit: 1.8 + index * 0.2,
      stunnedUntil: 0,
      seed: index * 2.3,
    }));
    this.enemies.forEach((enemy, index) => createLabel(scene, index === 4 ? "SAQUEADOR" : "JARNSMAN", enemy.root.position.add(new Vector3(0, 2.75, 0)), "#e88c78"));
  }

  private bindInput() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.key.toLowerCase());
    const ability = RUNE_ABILITIES.find((rune) => rune.key === event.key);
    if (ability) this.cast(ability.id);
    if (event.key.toLowerCase() === "r") this.reset();
  };

  private onKeyUp = (event: KeyboardEvent) => this.keys.delete(event.key.toLowerCase());

  public move(dx: number, dz: number) {
    if (!this.player || this.snapshot.phase === "defeat" || this.snapshot.phase === "victory") return;
    const next = this.player.position.add(new Vector3(dx, 0, dz).scale(0.48));
    next.x = Math.max(-8.8, Math.min(8.8, next.x));
    next.z = Math.max(-6.7, Math.min(6.2, next.z));
    this.player.position = next;
  }

  public cast(id: RuneId) {
    const rune = RUNE_ABILITIES.find((item) => item.id === id);
    if (!rune || this.snapshot.cooldowns[id] > 0 || this.snapshot.seidr < rune.cost || this.snapshot.phase === "defeat") return;
    this.snapshot.seidr = Math.max(0, this.snapshot.seidr - rune.cost);
    this.snapshot.cooldowns[id] = rune.cooldown;
    const living = this.enemies.filter((enemy) => enemy.root.isEnabled());
    const target = living.sort((a, b) => Vector3.Distance(a.root.position, this.player?.position ?? Vector3.Zero()) - Vector3.Distance(b.root.position, this.player?.position ?? Vector3.Zero()))[0];
    if (id === "urd" && target) {
      target.hp -= 18;
      this.snapshot.message = "Urd marca el hilo que une a Ingrid con su enemigo.";
      this.snapshot.messageSpeaker = "Ingrid";
      this.flash(target.root, COLORS.amber);
    }
    if (id === "isa") {
      living.slice(0, 3).forEach((enemy) => { enemy.stunnedUntil = this.elapsed + 3.8; this.flash(enemy.root, COLORS.ice); });
      this.snapshot.message = "Isa detiene el paso de los saqueadores.";
      this.snapshot.messageSpeaker = "Ingrid";
      this.pulse(this.player?.position ?? Vector3.Zero(), COLORS.ice);
    }
    if (id === "nauthiz") {
      living.forEach((enemy) => { if (Vector3.Distance(enemy.root.position, this.player?.position ?? Vector3.Zero()) < 4.8) { enemy.hp -= 30; this.flash(enemy.root, COLORS.carmine); } });
      this.snapshot.message = "Nauthiz aprieta la necesidad hasta volverla fuerza.";
      this.snapshot.messageSpeaker = "Ingrid";
      this.pulse(this.player?.position ?? Vector3.Zero(), COLORS.carmine);
    }
    if (id === "perthro") {
      const destination = this.player?.position.add(new Vector3(0, 0, -2.6));
      if (this.player && destination) this.player.position = destination;
      this.snapshot.message = "Perthro abre un paso donde la costa parecía cerrada.";
      this.snapshot.messageSpeaker = "Ingrid";
      this.pulse(this.player?.position ?? Vector3.Zero(), new Color3(0.52, 0.3, 0.78));
    }
    this.cleanupEnemies();
    this.onUpdate({ ...this.snapshot, cooldowns: { ...this.snapshot.cooldowns } });
  }

  public chooseSupport(id: "bjorn" | "hakon" | "astrid") {
    this.snapshot.support = id;
    const support = SUPPORTS.find((item) => item.id === id);
    if (!support) return;
    if (id === "bjorn") this.enemies.slice(0, 2).forEach((enemy) => { enemy.stunnedUntil = this.elapsed + 3; });
    if (id === "hakon") this.snapshot.message = "Hakon señala el hueco exacto entre las sombras.";
    if (id === "astrid") this.snapshot.hp = Math.min(this.snapshot.maxHp, this.snapshot.hp + 28);
    this.snapshot.messageSpeaker = support.name;
    this.snapshot.objective = this.snapshot.phase === "coast" ? "Alcanzá la bengala de Agnar" : this.snapshot.objective;
    this.onUpdate({ ...this.snapshot, cooldowns: { ...this.snapshot.cooldowns } });
  }

  public reset() {
    this.enemies.forEach((enemy) => enemy.root.dispose());
    this.snapshot = structuredClone(INITIAL_SNAPSHOT);
    this.elapsed = 0;
    this.demoStep = 0;
    this.spawnEnemies();
    if (this.player) this.player.position = new Vector3(0, 0, 5.2);
    this.onUpdate(this.snapshot);
  }

  private tick(dt: number) {
    this.elapsed += dt;
    if (!this.player) return;
    for (const rune of RUNE_ABILITIES) this.snapshot.cooldowns[rune.id] = Math.max(0, this.snapshot.cooldowns[rune.id] - dt);
    this.snapshot.seidr = Math.min(this.snapshot.maxSeidr, this.snapshot.seidr + dt * 3.5);
    this.snapshot.seconds += dt;
    if (this.demo) this.runDemoBeat();
    const dx = (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0) - (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0);
    const dz = (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0) - (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0);
    if (dx || dz) this.move(dx * dt * 3, dz * dt * 3);
    this.readNearbyRunes();
    for (const enemy of this.enemies) {
      if (!enemy.root.isEnabled() || this.elapsed < enemy.stunnedUntil) continue;
      const distance = Vector3.Distance(enemy.root.position, this.player.position);
      if (distance > 1.6) {
        const direction = this.player.position.subtract(enemy.root.position).normalize();
        enemy.root.position.addInPlace(direction.scale(dt * 0.27));
      } else if (this.elapsed > enemy.nextHit) {
        enemy.nextHit = this.elapsed + 1.8;
        this.snapshot.hp = Math.max(0, this.snapshot.hp - 5);
        this.snapshot.message = "Los Jarnsmen presionan la muralla.";
        this.snapshot.messageSpeaker = "Lectura de Ingrid";
        this.flash(this.player, COLORS.carmine);
      }
      enemy.root.rotation.y += dt * 0.32;
    }
    this.cleanupEnemies();
    if (this.snapshot.hp <= 0 && this.snapshot.phase !== "defeat") {
      this.snapshot.phase = "defeat";
      this.snapshot.message = NARRATIVE_BEATS.defeat.body;
      this.snapshot.objective = NARRATIVE_BEATS.defeat.objective;
    }
    this.onUpdate({ ...this.snapshot, cooldowns: { ...this.snapshot.cooldowns }, runesRead: [...this.snapshot.runesRead] });
  }

  private runDemoBeat() {
    const beats = [1.1, 2.1, 3.2, 4.5, 5.8];
    if (this.demoStep >= beats.length || this.elapsed < beats[this.demoStep]) return;
    if (this.demoStep === 0) this.move(0, -1);
    if (this.demoStep === 1) this.cast("isa");
    if (this.demoStep === 2) this.cast("urd");
    if (this.demoStep === 3) this.cast("nauthiz");
    if (this.demoStep === 4) this.chooseSupport("astrid");
    this.demoStep += 1;
  }

  private readNearbyRunes() {
    if (!this.player || this.snapshot.phase !== "coast") return;
    for (const [id, position] of Object.entries(runePositions) as [Exclude<RuneId, "urd">, Vector3][]) {
      if (!this.snapshot.runesRead.includes(id) && Vector3.Distance(this.player.position, position) < 1.4) {
        this.snapshot.runesRead.push(id);
        this.snapshot.message = id === "isa" ? "Isa. El hielo no niega el camino. Lo guarda." : id === "nauthiz" ? "Nauthiz. El clan no va a esperar." : "Perthro. El mar eligió su momento.";
        this.snapshot.messageSpeaker = "Ingrid";
        this.pulse(position, id === "isa" ? COLORS.ice : COLORS.amber);
      }
    }
    if (this.snapshot.runesRead.length === 3) {
      this.snapshot.objective = NARRATIVE_BEATS.coast.objective;
      this.snapshot.message = "La tercera señal se apaga. Algo se mueve en la costa.";
      this.snapshot.messageSpeaker = "Relato";
    }
  }

  private cleanupEnemies() {
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0 && enemy.root.isEnabled()) {
        enemy.root.setEnabled(false);
        this.snapshot.fragments += 1;
        this.snapshot.enemies = Math.max(0, this.snapshot.enemies - 1);
      }
    }
    if (this.snapshot.phase === "coast" && this.snapshot.enemies === 0 && this.snapshot.runesRead.length === 3) {
      this.snapshot.phase = "ritual";
      this.snapshot.objective = NARRATIVE_BEATS.ritual.objective;
      this.snapshot.message = "La bengala responde. El hörgr abre su sombra.";
      this.snapshot.messageSpeaker = "Relato";
      this.enemies = [];
    }
    if (this.snapshot.phase === "ritual" && this.snapshot.fragments >= 5) {
      this.snapshot.phase = "victory";
      this.snapshot.objective = NARRATIVE_BEATS.victory.objective;
      this.snapshot.message = NARRATIVE_BEATS.victory.body;
      this.snapshot.messageSpeaker = "Las Nornas";
    }
  }

  private flash(node: TransformNode, color: Color3) {
    const scene = this.scene;
    if (!scene) return;
    const ring = MeshBuilder.CreateTorus("impact-ring", { diameter: 1.25, thickness: 0.075, tessellation: 18 }, scene);
    ring.position = node.position.add(new Vector3(0, 0.08, 0));
    ring.rotation.x = Math.PI / 2;
    ring.material = material(scene, "impact", color, color);
    const start = this.elapsed;
    scene.onBeforeRenderObservable.addOnce(() => {
      const animate = () => {
        const progress = Math.min(1, (this.elapsed - start) / 0.32);
        ring.scaling.setAll(1 + progress * 1.8);
        ring.visibility = 1 - progress;
        if (progress < 1) requestAnimationFrame(animate); else ring.dispose();
      };
      animate();
    });
  }

  private pulse(position: Vector3, color: Color3) {
    const scene = this.scene;
    if (!scene) return;
    const ring = MeshBuilder.CreateTorus("rune-pulse", { diameter: 1.8, thickness: 0.1, tessellation: 24 }, scene);
    ring.position = position.clone();
    ring.position.y = 0.1;
    ring.rotation.x = Math.PI / 2;
    ring.material = material(scene, "pulse", color, color);
    const start = this.elapsed;
    const animate = () => {
      const progress = Math.min(1, (this.elapsed - start) / 0.7);
      ring.scaling.setAll(0.35 + progress * 2.2);
      ring.visibility = 1 - progress;
      if (progress < 1) requestAnimationFrame(animate); else ring.dispose();
    };
    animate();
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.engine?.stopRenderLoop();
    this.scene?.dispose();
    this.engine?.dispose();
  }
}
