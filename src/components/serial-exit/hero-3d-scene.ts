/**
 * Hero 3D depth layer — vanilla three.js (no React renderer, no THREE.Clock).
 *
 * The hero PHOTOGRAPH (cracked obsidian monolith + amber ring) is the star
 * and stays visible underneath. This transparent canvas floats real 3D depth
 * in front of it: obsidian shards orbiting the monolith (one InstancedMesh =
 * one draw call) and a field of amber dust motes (one Points draw call),
 * both reacting to the pointer with parallax. Everything is procedural:
 * zero texture or model downloads.
 *
 * Performance contract
 *  - Renders ONLY while the hero is on screen AND the tab is visible.
 *  - Pixel ratio capped at 1.5.
 *  - Slowness NEVER destroys the scene. If the median frame time stays poor
 *    (after a 3 s settle period, in production only) quality steps down:
 *      tier 0 full -> 1 DPR 1 -> 2 half the shards/dust, no parallax -> 3 30fps cap.
 *  - Only unmount or WebGL context loss disposes it (the poster image stays).
 *  - dispose() releases geometries, materials, textures, renderer and context.
 *  - container[data-hero3d] = tier-0..3 | poster (handy for debugging, no console output).
 *
 * This module is dynamically imported by hero-3d.tsx so three.js never lands
 * in the initial bundle.
 */
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
  type Material,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type HeroSceneHandle = { dispose: () => void };
export type HeroSceneOptions = { onReady: () => void; onFail: () => void };

const AMBER = 0xff7a1a;
const FRAGMENTS = 22;
const DUST = 260;

/** Deterministic position-based noise so duplicated face vertices displace identically (no cracks). */
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}

/** A low-poly, irregular shard (jittered icosahedron, stretched). Duplicate face vertices share the same jitter. */
function makeShard(): IcosahedronGeometry {
  const geo = new IcosahedronGeometry(0.16, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + hash3(Math.round(x * 900), Math.round(y * 900), Math.round(z * 900)) * 0.9;
    pos.setXYZ(i, x * k, y * k * 1.5, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeDotTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function createHeroScene(container: HTMLElement, opts: HeroSceneOptions): HeroSceneHandle {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "default" });
  } catch {
    canvas.remove();
    opts.onFail();
    return { dispose() {} };
  }

  let disposed = false;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 8);

  // --- Image-based lighting from a tiny procedural room (one-time PMREM bake) ---
  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 1.0;
  pmrem.dispose();

  // --- Lights: warm amber key from the front-right, cool-neutral rim from the back-left ---
  const key = new PointLight(AMBER, 12, 0, 2);
  key.position.set(3.2, 1.2, 4);
  const rim = new DirectionalLight(0xfff0e0, 1.6);
  rim.position.set(-4, 3, -2);
  scene.add(key, rim);

  // --- Subject: shards + dust, both children of `rig` (which tracks the poster's monolith) ---
  const rig = new Group();
  scene.add(rig);

  const shardGeo = makeShard();
  const shardMat = new MeshStandardMaterial({
    color: 0x08080a,
    metalness: 1,
    roughness: 0.2,
    flatShading: true,
    emissive: AMBER,
    emissiveIntensity: 0.015,
  });
  const frags = new InstancedMesh(shardGeo, shardMat, FRAGMENTS);
  const params = Array.from({ length: FRAGMENTS }, (_, i) => ({
    r: 2.1 + ((i * 0.37) % 1.9),
    speed: (0.05 + ((i * 0.13) % 0.1)) * (i % 2 ? 1 : -1),
    phase: (i / FRAGMENTS) * Math.PI * 2,
    y: (((i * 0.61) % 1) - 0.5) * 2.6,
    s: 0.28 + ((i * 0.29) % 0.7),
    spin: 0.25 + ((i * 0.17) % 0.55),
  }));
  const dummy = new Object3D();
  rig.add(frags);

  // Amber dust motes: static random positions, animated purely by rotating the whole cloud.
  const dustGeo = new BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const r = 1.6 + (Math.abs(hash3(i, 5.3, 9.1)) * 2 + 0.2) * 3.4;
    const a = (hash3(i, 2.2, 4.4) + 0.5) * Math.PI * 2;
    dustPos[i * 3] = Math.cos(a) * r;
    dustPos[i * 3 + 1] = hash3(i, 8.8, 1.3) * 6;
    dustPos[i * 3 + 2] = Math.sin(a) * r * 0.7 - 1;
  }
  dustGeo.setAttribute("position", new BufferAttribute(dustPos, 3));
  const dustTex = makeDotTexture();
  const dustMat = new PointsMaterial({
    map: dustTex,
    color: 0xffa05a,
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const dust = new Points(dustGeo, dustMat);
  rig.add(dust);

  // --- Sizing / layout ---
  const layout = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const wide = camera.aspect > 1.25;
    // The poster's monolith sits right-of-centre on wide screens (≈62% across, ≈43% down).
    rig.position.set(wide ? halfW * 0.24 : 0, halfH * 0.14, 0);
    rig.scale.setScalar(wide ? Math.max(0.75, Math.min(1.15, camera.aspect / 1.6)) : 0.8);
  };
  const ro = new ResizeObserver(layout);
  ro.observe(container);
  layout();

  // --- Input: gentle pointer parallax ---
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let parallaxOn = true;
  const onPointer = (e: PointerEvent) => {
    if (!parallaxOn) return;
    tx = (e.clientX / window.innerWidth - 0.5) * 0.7;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  // --- Render loop: visibility gating + graceful quality tiers (never destroys the scene) ---
  const adaptive = process.env.NODE_ENV === "production" && navigator.webdriver !== true;
  let tier = 0;
  let raf = 0;
  let running = false;
  let inView = true;
  let last = 0;
  let t = 0;
  let sentReady = false;
  let frameNo = 0;
  let settleUntil = 0; // frame times before this timestamp are ignored (startup, tab / scroll re-entry)
  let lastStep = 0;
  let slowWindows = 0;
  const deltas: number[] = [];

  const setTier = (n: number) => {
    tier = n;
    container.dataset.hero3d = `tier-${n}`;
  };

  const stepDown = (now: number) => {
    lastStep = now;
    if (tier === 0) {
      dpr = 1;
      renderer.setPixelRatio(1);
      layout();
    } else if (tier === 1) {
      frags.count = Math.floor(FRAGMENTS / 2);
      dustGeo.setDrawRange(0, Math.floor(DUST / 2));
      parallaxOn = false;
      tx = 0;
      ty = 0;
    }
    // tier 2 -> 3 only halves the frame rate (handled at the top of frame())
    if (tier < 3) setTier(tier + 1);
  };

  const fail = () => {
    // Used ONLY for WebGL context loss: nothing left to render with.
    if (disposed) return;
    dispose();
    opts.onFail();
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(now - last, 100);
    last = now;
    t += dt / 1000;
    if (tier >= 3 && (frameNo++ & 1) === 1) return; // 30fps cap

    const k = 1 - Math.exp(-dt / 220);
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    rig.rotation.y = cx;
    rig.rotation.x = cy;
    dust.rotation.y = t * 0.035;
    dust.position.y = Math.sin(t * 0.25) * 0.15;
    key.intensity = 12 + Math.sin(t * 0.8) * 2;

    const n = frags.count;
    for (let i = 0; i < n; i++) {
      const p = params[i];
      const a = p.phase + t * p.speed;
      dummy.position.set(Math.cos(a) * p.r, p.y + Math.sin(a * 1.7) * 0.15, Math.sin(a) * p.r * 0.7);
      dummy.rotation.set(t * p.spin, t * p.spin * 0.7, 0);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      frags.setMatrixAt(i, dummy.matrix);
    }
    frags.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);

    if (!sentReady) {
      sentReady = true;
      setTier(0);
      opts.onReady();
    }

    if (adaptive && now > settleUntil) {
      deltas.push(dt);
      if (deltas.length >= 90) {
        const sorted = [...deltas].sort((a, b) => a - b);
        const median = sorted[sorted.length >> 1];
        deltas.length = 0;
        slowWindows = median > 34 ? slowWindows + 1 : 0;
        // two consecutive slow windows, at most one step per 4 s
        if (slowWindows >= 2 && now - lastStep > 4000 && tier < 3) {
          slowWindows = 0;
          stepDown(now);
        }
      }
    }
  };

  const start = () => {
    if (running || disposed || !inView || document.hidden) return;
    running = true;
    last = performance.now();
    settleUntil = last + 3000; // startup / re-entry hitches must not count as "slow device"
    deltas.length = 0;
    slowWindows = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    },
    { threshold: 0 }
  );
  io.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    fail();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  function dispose() {
    if (disposed) return;
    disposed = true;
    container.dataset.hero3d = "poster";
    stop();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);

    const geos: BufferGeometry[] = [shardGeo, dustGeo];
    const mats: Material[] = [shardMat, dustMat];
    const texs: Texture[] = [dustTex, envTarget.texture];
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((x) => x.dispose());
    frags.dispose();
    envTarget.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  start();
  return { dispose };
}
