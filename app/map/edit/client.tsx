// app/map/edit/page.tsx
"use client";

// was previously the frontend page.tsx moved here for more seamless merge with main later

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  useGLTF,
  Sky,
  Environment,
  ContactShadows,
} from "@react-three/drei";
// UNUSED: framer-motion isn't used in this file
// import { motion, type Variants } from "framer-motion";
// UNUSED: LinkAsButton not used here
// import { LinkAsButton } from "../../components/LinkAsButton";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

//import CreateTestOasisButton from "./CreateOasisAndEditButton";

type Vec3 = [number, number, number];

export type WordListLite = {
  id: string;
  title: string;
  language: string | null;
};

type Oasis3D = {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  title: string;
};

/*
type Packet = {
  id: string;
  title: string;
  createdAt: number;
};
*/

const STORAGE_KEY_3D = "fluentures.oases.3d";
//const STORAGE_KEY_PACKETS = "fluentures.packets";

const OASIS_URL = "/blenderModels/oasis2.glb";
const DESERT_URL = "/blenderModels/desertBackground22.glb";

let saveDebounceHandle: number | null = null;

/* ---------------- Desert background 3D model (GLB) ---------------- */
function DesertBackground({
  position = [0, 0, 0],
  rotation = [0, Math.PI / 4, 0],
  scale = 1,
  targetWidth = 60,
  anchorX = "min",
  anchorZ = "min",
  targetX = -30,
  targetZ = -30,
}: {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  targetWidth?: number;
  anchorX?: "min" | "center" | "max";
  anchorZ?: "min" | "center" | "max";
  targetX?: number;
  targetZ?: number;
}) {
  const { scene } = useGLTF(DESERT_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    // Reset for StrictMode
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.setScalar(1);
    clone.updateMatrixWorld(true);

    // Fit to target width
    const authoredBox = new THREE.Box3().setFromObject(clone);
    const authoredSize = authoredBox.getSize(new THREE.Vector3());
    const s = authoredSize.x > 0 ? (targetWidth / authoredSize.x) * scale : scale;
    clone.scale.setScalar(s);
    clone.updateMatrixWorld(true);

    // Apply rotation for edge-anchoring and then compute bounds
    clone.rotation.set(rotation[0], rotation[1], rotation[2]);
    clone.updateMatrixWorld(true);

    // Ground to y = 0
    const boxAfter = new THREE.Box3().setFromObject(clone);
    clone.position.y -= boxAfter.min.y;
    clone.updateMatrixWorld(true);

    // Anchor to requested edges
    const anchoredBox = new THREE.Box3().setFromObject(clone);
    const centerX = (anchoredBox.min.x + anchoredBox.max.x) / 2;
    const centerZ = (anchoredBox.min.z + anchoredBox.max.z) / 2;
    const currentX =
      anchorX === "min" ? anchoredBox.min.x : anchorX === "max" ? anchoredBox.max.x : centerX;
    const currentZ =
      anchorZ === "min" ? anchoredBox.min.z : anchorZ === "max" ? anchoredBox.max.z : centerZ;

    clone.position.x += targetX - currentX;
    clone.position.z += targetZ - currentZ;

    // External offset
    clone.position.x += position[0];
    clone.position.y += position[1];
    clone.position.z += position[2];

    clone.updateMatrixWorld(true);
  }, [clone, scale, targetWidth, rotation, anchorX, anchorZ, targetX, targetZ, position]);

  return <primitive object={clone} />;
}

/* ---------------- Helpers ---------------- */
/*
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `oasis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
*/

/*----------------- compute defaults (kept) --------------------*/
function computeDefaultTransforms(lists: WordListLite[]): Oasis3D[] {
  // Place oases on a ring by default
  const radius = 8;
  const step = (2 * Math.PI) / Math.max(1, lists.length);
  return lists.map((wl, i) => {
    const angle = i * step;
    return {
      id: wl.id,
      title: wl.title,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      rotation: [0, 0, 0],
      scale: 1,
    };
  });
}

/* OLD MERGE helper — no longer needed with loadSaved() 
function mergeWithSaved(wordlists: WordListLite[]): Oasis3D[] {
  let savedById: Record<string, Oasis3D> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_3D);
    if (raw) {
      const arr = JSON.parse(raw) as Oasis3D[];
      savedById = Object.fromEntries(arr.map((o) => [o.id, o]));
    }
  } catch {}
  const defaults = computeDefaultTransforms(wordlists);
  const merged = wordlists.map((wl) => {
    const s = savedById[wl.id];
    return s
      ? {
          id: wl.id,
          title: wl.title,
          position: s.position,
          rotation: s.rotation,
          scale: s.scale ?? 1,
        }
      : (defaults.find((d) => d.id === wl.id) as Oasis3D);
  });
  try {
    localStorage.setItem(STORAGE_KEY_3D, JSON.stringify(merged));
  } catch {}
  return merged;
}
*/

/* safe load + debounced save */
function loadSaved(): Record<string, Oasis3D> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_3D);
    const arr: Oasis3D[] = raw ? JSON.parse(raw) : [];
    return Object.fromEntries(arr.map((o) => [o.id, o]));
  } catch {
    return {};
  }
}

function saveDebounced(instances: Oasis3D[]) {
  // simple rAF debounce to avoid hammering localStorage
  if (saveDebounceHandle !== null) {
    cancelAnimationFrame(saveDebounceHandle);
  }
  saveDebounceHandle = requestAnimationFrame(() => {
    localStorage.setItem(STORAGE_KEY_3D, JSON.stringify(instances));
  });
}

/* ---------------- Models & Instances ---------------- */
function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(OASIS_URL, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}

// Invisible plane used ONLY for click-to-place (avoid z-fighting with small y-offset)
function Ground({ onPlace }: { onPlace: (point: Vec3) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.02, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const p = e.point;
        onPlace([p.x, 0, p.z]);
      }}
      receiveShadow
      visible={false}
    >
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

function OasisInstance({
  data,
  isSelected,
  onSelect,
}: {
  data: Oasis3D;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isSelected ? 0.35 + Math.sin(t * 3) * 0.15 : 0.0;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.position[0], data.position[1] ?? 0, data.position[2]]}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
    >
      {/* Larger invisible hit-box for easier clicking */}
      <mesh position={[0, 1.0 * data.scale, 0]} visible={false}>
        <boxGeometry args={[2 * data.scale, 2 * data.scale, 2 * data.scale]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <OasisModel scale={data.scale} />

      {/* Floating label */}
      <Html
        position={[0, 1.7 * data.scale, 0]}
        center
        style={{
          pointerEvents: "none",
          background: "rgba(255,255,255,0.85)",
          padding: "4px 8px",
          borderRadius: 10,
          fontSize: 12,
          color: "#111",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          whiteSpace: "nowrap",
        }}
      >
        {data.title}
      </Html>

      {/* Selection ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.95 * data.scale, 1.25 * data.scale, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

function PanLimiter({
  controls,
  bounds,
}: {
  controls: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}) {
  useFrame(() => {
    const c = controls.current;
    if (!c) return;

    const t = c.target;
    const beforeX = t.x;
    const beforeZ = t.z;

    t.x = Math.min(bounds.maxX, Math.max(bounds.minX, t.x));
    t.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, t.z));

    if (t.x !== beforeX || t.z !== beforeZ) {
      const off = new THREE.Vector3().subVectors(c.object.position, c.target);
      c.object.position.copy(t).add(off);
    }
  });
  return null;
}

function ControlsWithLimits({
  controlsRef,
  bounds,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; maxZ: number; minZ: number };
}) {
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableRotate={false}
        enablePan
        enableZoom
        minDistance={6}
        maxDistance={26}
        minPolarAngle={0.9}
        maxPolarAngle={Math.PI / 2.1}
      />
      <PanLimiter controls={controlsRef} bounds={bounds} />
    </>
  );
}

/* ---------------- ADDED: GlideControlsUI (arrow pad for screen-aligned gliding) ---------------- */
// This is the same motion control from your map page, lifted verbatim and scoped here.
function GlideControlsUI({
  controlsRef,
  bounds,
  step = 2,
  duration = 500,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  step?: number;
  duration?: number;
}) {
  const rafRef = useRef<number | null>(null);

  const glideScreen = (sx: number, sz: number) => {
    const c = controlsRef.current;
    if (!c) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const cam = c.object as THREE.PerspectiveCamera;

    // Screen-aligned basis projected onto XZ plane
    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const up = new THREE.Vector3(0, 1, 0);
    const right = forward.clone().cross(up).normalize();

    // Map screen step to world delta
    const worldDelta = new THREE.Vector3()
      .addScaledVector(right, sx * step)
      .addScaledVector(forward, -sz * step);

    const start = performance.now();
    const from = c.target.clone();
    const unclampedTo = from.clone().add(worldDelta);
    const to = new THREE.Vector3(
      Math.min(bounds.maxX, Math.max(bounds.minX, unclampedTo.x)),
      from.y,
      Math.min(bounds.maxZ, Math.max(bounds.minZ, unclampedTo.z)),
    );

    const animate = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const ease = k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k;

      const cur = from.clone().lerp(to, ease);
      const off = new THREE.Vector3().subVectors(c.object.position, c.target);

      c.target.copy(cur);
      c.object.position.copy(cur).add(off);

      if (k < 1) rafRef.current = requestAnimationFrame(animate);
      else rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => glideScreen(0, -1)}
          className="rounded-md bg-white/90 px-3 py-2 text-sm shadow"
        >
          ↑
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => glideScreen(-1, 0)}
          className="rounded-md bg-white/90 px-3 py-2 text-sm shadow -translate-x-12"
        >
          ←
        </button>
        <button
          onClick={() => glideScreen(1, 0)}
          className="rounded-md bg-white/90 px-3 py-2 text-sm shadow"
        >
          →
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => glideScreen(0, 1)}
          className="rounded-md bg-white/90 px-3 py-2 text-sm shadow"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

/* ---------------- UI animation ---------------- */
// ❌ UNUSED: panelIn is not used
// const panelIn: Variants = {
//   hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     filter: "blur(0)",
//     transition: { duration: 0.45, ease: "easeOut" },
//   },
// };

/* ---------------- Page ---------------- */
export default function MapEditView({
  wordlists,
  selectedLanguage,
  deleteAction,
  createAction,
}: {
  wordlists: WordListLite[];
  selectedLanguage?: string | null;
  deleteAction: (formData: FormData) => Promise<void>;
  createAction?: (formData: FormData) => Promise<void>;
}) {
  const [instances, setInstances] = useState<Oasis3D[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // ✅ StrictMode init guard
  const didInit = useRef(false);

  // Same bounds used on your Map page
  const bounds = { minX: -30, maxX: 30, minZ: -50, maxZ: 25 };

  // ❌ OLD: Build instances from server wordlists + saved transforms
  // useEffect(() => {
  //   setInstances(mergeWithSaved(wordlists));
  // }, [wordlists]);

  // ✅ NEW: Build instances (saved -> defaults), guarded against double-mount
  useEffect(() => {
    if (didInit.current) return; // prevent double init in React StrictMode
    didInit.current = true;

    const savedById = loadSaved();
    const defaults = computeDefaultTransforms(wordlists);

    const merged = wordlists.map((wl) => {
      const s = savedById[wl.id];
      return s
        ? { ...s, title: wl.title } // keep saved transform, refresh title from DB
        : (defaults.find((d) => d.id === wl.id) as Oasis3D);
    });

    setInstances(merged);
  }, [wordlists]);

  // ❌ OLD: Persist transforms directly every change
  // useEffect(() => {
  //   try {
  //     localStorage.setItem(STORAGE_KEY_3D, JSON.stringify(instances));
  //   } catch {}
  // }, [instances]);

  // ✅ NEW: Debounced persistence after edits
  useEffect(() => {
    if (!didInit.current) return;
    saveDebounced(instances);
  }, [instances]);

  // NEW: reconcile/prune whenever the server IDs set changes (after creates/deletes)
  const idsKey = useMemo(
    () => JSON.stringify(wordlists.map((w) => w.id).sort()),
    [wordlists]
  ); // NEW

  useEffect(() => {
    if (!didInit.current) return; // only run after initial build
    const savedById = loadSaved();
    const defaults = computeDefaultTransforms(wordlists);
    const merged = wordlists.map((wl) => {
      const s = savedById[wl.id];
      return s ? { ...s, title: wl.title } : (defaults.find((d) => d.id === wl.id) as Oasis3D);
    });
    setInstances(merged);
    saveDebounced(merged);
  }, [idsKey]); // NEW

  // Mutators for selected
  const updateSelected = (fn: (o: Oasis3D) => Oasis3D) => {
    if (!selectedId) return;
    setInstances((prev) => prev.map((o) => (o.id === selectedId ? fn(o) : o)));
  };
  const nudge = (dx = 0, dz = 0) =>
    updateSelected((o) => ({ ...o, position: [o.position[0] + dx, 0, o.position[2] + dz] as Vec3 }));
  const rotateY = (d = 0) =>
    updateSelected((o) => ({ ...o, rotation: [o.rotation[0], o.rotation[1] + d, o.rotation[2]] as Vec3 }));
  const scaleBy = (factor = 1) =>
    updateSelected((o) => ({ ...o, scale: Math.max(0.2, Math.min(5, o.scale * factor)) }));
  const placeSelectedAt = (p: Vec3) =>
    updateSelected((o) => ({ ...o, position: [p[0], 0, p[2]] as Vec3 }));

  // Delete in DB
  const handleDeleteSelected = async () => {
    if (!selectedId) return;

    // NEW: optimistic local removal + LS sync so the GLB disappears immediately
    setInstances((prev) => {
      const next = prev.filter((o) => o.id !== selectedId);
      saveDebounced(next);
      return next;
    });
    const deletingId = selectedId; // capture before clearing
    setSelectedId(null);

    const fd = new FormData();
    fd.append("listId", deletingId);
    await deleteAction(fd); // server revalidates/redirects; idsKey effect will reconcile if needed
  };

  // Create in DB
  const handleCreate = async () => {
    if (!createAction) return;
    const name =
      typeof window !== "undefined"
        ? (prompt("Name your new oasis:", "New Oasis") ?? "New Oasis")
        : "New Oasis";
    const fd = new FormData();
    fd.append("name", name);
    await createAction(fd); // server redirects to /oasis/[id]/edit
  };

  return (
  <div className="relative min-h-screen w-full overflow-hidden flex flex-col gap-6 p-4 pt-30">
          <img src="/desert.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
          animation: "float1 14s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
          animation: "float2 16s ease-in-out infinite",
        }}
      />

      {/* HEADER / NAVIGATION */}


    {/* ===== TOOLBAR ===== */}
    <div className="relative p-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-40 pointer-events-none" />
        {/* Top row — title, language, back button */}
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <h1 className="text-white text-xl font-semibold">Edit Map</h1>
      <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs text-white/85 bg-white/10 ring-1 ring-white/20">
        <span className="mr-1 opacity-70">Language:</span>
        <strong>{selectedLanguage ?? "All"}</strong>
      </span>
    </div>

    <a
      href="/map"
      className="rounded-lg px-4 py-2 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/30 transition"
    >
      Back
    </a>
  </div>




      {selectedId ? (
        <>
          <span className="text-sm text-gray-100">
            Selected: <code>{instances.find((i) => i.id === selectedId)?.title}</code>
          </span>

          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-300 mr-1">Move</span>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => nudge(-0.5, 0)} title="Left">
              ←
            </button>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => nudge(0.5, 0)} title="Right">
              →
            </button>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => nudge(0, 0.5)} title="Forward (−Z)">
              ↑
            </button>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => nudge(0, -0.5)} title="Backward (+Z)">
              ↓
            </button>
          </div>

          {/* rotation + scale blocks unchanged */}
          <div className="flex items-center gap-1 ml-3">
            <span className="text-sm text-gray-300 mr-1">Rotate</span>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => rotateY((15 * Math.PI) / 180)} title="+15°">
              ⟳
            </button>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => rotateY((-15 * Math.PI) / 180)} title="-15°">
              ⟲
            </button>
          </div>

          <div className="flex items-center gap-1 ml-3">
            <span className="text-sm text-gray-300 mr-1">Scale</span>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => scaleBy(1.1)} title="Bigger">
              +
            </button>
            <button className="px-2 py-1 rounded border border-white/20 bg-white/20 hover:bg-white/30 text-white" onClick={() => scaleBy(1 / 1.1)} title="Smaller">
              −
            </button>
          </div>

            <div className="ml-auto flex items-center gap-2">
              {createAction && (
                <button
                  onClick={handleCreate}
                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  title="Create a new WordList and Oasis"
                >
                  ➕ Create New Oasis (DB)
                </button>
              )}
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50"
                disabled={!selectedId}
                title="Delete this WordList in DB"
              >
                Delete Selected (DB)
              </button>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-gray-300">
              Tip: Select an oasis, then click the sand to reposition. Use the controls to move/rotate/scale.
            </div>
            {createAction && (
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                title="Create a new WordList and Oasis"
              >
                ➕ Create New Oasis (DB)
              </button>
            )}
          </div>
        )}
      </div>

    {/* ===== MAP CANVAS ===== */}
    <div className="h-[70vh] relative rounded-xl border border-white/10 bg-black/20 shadow-xl overflow-hidden">
      <Canvas shadows camera={{ position: [9, 7, 9], fov: 46, near: 0.1, far: 200 }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 35, 120]} />
        <Sky
          distance={450000}
          sunPosition={[25, 12, -20]}
          mieCoefficient={0.01}
          mieDirectionalG={0.9}
          rayleigh={3}
          turbidity={6}
          inclination={0.49}
          azimuth={0.25}
        />
        <Environment preset="sunset" />
        <ambientLight intensity={0.35} />
        <directionalLight position={[10, 12, 6]} intensity={1.2} castShadow />
        <directionalLight position={[-10, 6, -6]} intensity={0.25} />
        <Suspense fallback={<Html center style={{ color: "white" }}>Loading sand…</Html>}>
          <DesertBackground
            rotation={[0, Math.PI / 4, 0]}
            scale={1}
            targetWidth={60}
            anchorX="min"
            anchorZ="min"
            targetX={-30}
            targetZ={-30}
          />
        </Suspense>
        <Ground onPlace={placeSelectedAt} />
        <Suspense fallback={<Html center style={{ color: "white" }}>Loading oases…</Html>}>
          {instances.map((o) => (
            <OasisInstance key={o.id} data={o} isSelected={o.id === selectedId} onSelect={setSelectedId} />
          ))}
        </Suspense>
        <ContactShadows position={[0, 0, 0]} scale={50} blur={2.4} opacity={0.5} far={15} />
        <ControlsWithLimits controlsRef={controlsRef} bounds={bounds} />
      </Canvas>
      <GlideControlsUI controlsRef={controlsRef} bounds={bounds} />
    </div>
  </div>
);
}

useGLTF.preload(DESERT_URL);
useGLTF.preload(OASIS_URL);
