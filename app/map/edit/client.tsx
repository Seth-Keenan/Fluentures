"use client";

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
  Environment,
  ContactShadows,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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

const STORAGE_KEY_3D = "fluentures.oases.3d";

const OASIS_URL = "/blenderModels/oasisModel.glb";
const DESERT_URL = "/blenderModels/desertBackground22.glb";

let saveDebounceHandle: number | null = null;

/* ---------------- Mobile List Edit View ---------------- */
function MobileListEditView({
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!createAction) return;
    const name = prompt("Name your new oasis:", "New Oasis") ?? "New Oasis";
    const fd = new FormData();
    fd.append("name", name);
    await createAction(fd);
  };

  const handleDelete = async (oasisId: string, oasisTitle: string) => {
    if (!confirm(`Delete "${oasisTitle}"? This cannot be undone.`)) return;

    setIsDeleting(oasisId);
    const fd = new FormData();
    fd.append("listId", oasisId);
    await deleteAction(fd);
    setIsDeleting(null);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="mx-auto mt-4 flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-white text-xl font-semibold truncate">
                Manage Oases
              </h1>
              <p className="text-white/85 text-xs mt-0.5">
                Add or remove your oases
              </p>
            </div>
            <a
              href="/map"
              className="shrink-0 rounded-lg px-3 py-1.5 bg-white/10 text-xs text-white hover:bg-white/20 ring-1 ring-white/30 transition"
            >
              Back
            </a>
          </div>

          {selectedLanguage && (
            <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] text-white/85 bg-white/10 ring-1 ring-white/20 w-fit">
              <span className="mr-1 opacity-70">Language:</span>
              <strong>{selectedLanguage}</strong>
            </span>
          )}
        </div>
      </header>

      {/* Create Button */}
      {createAction && (
        <section className="relative z-10 mx-auto mt-3 w-full max-w-md px-4">
          <button
            onClick={handleCreate}
            className="w-full rounded-xl border-2 border-dashed border-white/30 bg-white/5 px-4 py-4 text-white hover:bg-white/10 hover:border-white/40 transition flex flex-col items-center gap-1.5"
          >
            <span className="text-2xl leading-none">➕</span>
            <span className="font-semibold text-sm">Create New Oasis</span>
          </button>
        </section>
      )}

      {/* List of Oases */}
      <section className="relative z-10 mx-auto my-4 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl p-3">
          {wordlists.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-white/70 text-base">No oases yet</p>
              <p className="text-white/50 text-xs mt-1.5">
                Create your first oasis to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {wordlists.map((wl) => (
                <div
                  key={wl.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-3 transition hover:bg-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {wl.title}
                    </h3>
                    {wl.language && (
                      <p className="text-white/60 text-[11px] mt-0.5 truncate">
                        Language: {wl.language}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <a
                      href={`/oasis/${wl.id}`}
                      className="rounded-lg px-3 py-1.5 bg-blue-500/20 text-[11px] text-blue-100 hover:bg-blue-500/30 border border-blue-400/30 transition"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(wl.id, wl.title)}
                      disabled={isDeleting === wl.id}
                      className="rounded-lg px-3 py-1.5 bg-red-500/20 text-[11px] text-red-100 hover:bg-red-500/30 border border-red-400/30 transition disabled:opacity-50"
                    >
                      {isDeleting === wl.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hint */}
      <div className="relative z-10 mx-auto mb-6 w-full max-w-md px-4">
        <p className="text-center text-[11px] text-white/70">
          💡 The 3D map editor is available on desktop devices
        </p>
      </div>
    </div>
  );
}

/* ---------------- Desert background 3D model (GLB) ---------------- */
function DesertBackground({
  position = [0, 0, 0] as Vec3,
  rotation = [0, Math.PI / 4, 0] as Vec3,
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
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.setScalar(1);
    clone.updateMatrixWorld(true);

    const authoredBox = new THREE.Box3().setFromObject(clone);
    const authoredSize = authoredBox.getSize(new THREE.Vector3());
    const s =
      authoredSize.x > 0 ? (targetWidth / authoredSize.x) * scale : scale;
    clone.scale.setScalar(s);
    clone.updateMatrixWorld(true);

    clone.rotation.set(rotation[0], rotation[1], rotation[2]);
    clone.updateMatrixWorld(true);

    const boxAfter = new THREE.Box3().setFromObject(clone);
    clone.position.y -= boxAfter.min.y;
    clone.updateMatrixWorld(true);

    const anchoredBox = new THREE.Box3().setFromObject(clone);
    const centerX = (anchoredBox.min.x + anchoredBox.max.x) / 2;
    const centerZ = (anchoredBox.min.z + anchoredBox.max.z) / 2;
    const currentX =
      anchorX === "min"
        ? anchoredBox.min.x
        : anchorX === "max"
        ? anchoredBox.max.x
        : centerX;
    const currentZ =
      anchorZ === "min"
        ? anchoredBox.min.z
        : anchorZ === "max"
        ? anchoredBox.max.z
        : centerZ;

    clone.position.x += targetX - currentX;
    clone.position.z += targetZ - currentZ;

    clone.position.x += position[0];
    clone.position.y += position[1];
    clone.position.z += position[2];

    clone.updateMatrixWorld(true);
  }, [clone, scale, targetWidth, rotation, anchorX, anchorZ, targetX, targetZ, position]);

  return <primitive object={clone} />;
}

/*----------------- compute defaults --------------------*/
function computeDefaultTransforms(lists: WordListLite[]): Oasis3D[] {
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
      <mesh position={[0, 1.0 * data.scale, 0]} visible={false}>
        <boxGeometry args={[2 * data.scale, 2 * data.scale, 2 * data.scale]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <OasisModel scale={data.scale} />

      <Html
        position={[0, 0.8 * data.scale, 0]}
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

      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, 0]}
      >
        <ringGeometry args={[0.6 * data.scale, 0.85 * data.scale, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

/* ---------------- Pan limiter & controls ---------------- */
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

/* ---------------- GlideControlsUI ---------------- */
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

    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const up = new THREE.Vector3(0, 1, 0);
    const right = forward.clone().cross(up).normalize();

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

/* ---------------- Desktop 3D Edit View ---------------- */
function DesktopMapEditView({
  selectedLanguage,
  deleteAction,
  createAction,
  instances,
  setInstances,
  selectedId,
  setSelectedId,
  controlsRef,
  bounds,
}: {
  wordlists: WordListLite[];
  selectedLanguage?: string | null;
  deleteAction: (formData: FormData) => Promise<void>;
  createAction?: (formData: FormData) => Promise<void>;
  instances: Oasis3D[];
  setInstances: React.Dispatch<React.SetStateAction<Oasis3D[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}) {
  const updateSelected = (fn: (o: Oasis3D) => Oasis3D) => {
    if (!selectedId) return;
    setInstances((prev) => prev.map((o) => (o.id === selectedId ? fn(o) : o)));
  };

  const rotateY = (d = 0) =>
    updateSelected((o) => ({
      ...o,
      rotation: [o.rotation[0], o.rotation[1] + d, o.rotation[2]] as Vec3,
    }));

  const scaleBy = (factor = 1) =>
    updateSelected((o) => ({
      ...o,
      scale: Math.max(0.2, Math.min(5, o.scale * factor)),
    }));

  const placeSelectedAt = (p: Vec3) =>
    updateSelected((o) => ({ ...o, position: [p[0], 0, p[2]] as Vec3 }));

  const nudgeScreen = (sx = 0, sz = 0) => {
    const c = controlsRef.current;
    if (!c || !selectedId) return;

    const cam = c.object as THREE.PerspectiveCamera;

    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .copy(forward)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize();

    const delta = new THREE.Vector3()
      .addScaledVector(right, sx * 0.5)
      .addScaledVector(forward, -sz * 0.5);

    updateSelected((o) => ({
      ...o,
      position: [o.position[0] + delta.x, 0, o.position[2] + delta.z] as Vec3,
    }));
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;

    setInstances((prev) => {
      const next = prev.filter((o) => o.id !== selectedId);
      saveDebounced(next);
      return next;
    });

    const deletingId = selectedId;
    setSelectedId(null);

    const fd = new FormData();
    fd.append("listId", deletingId);
    await deleteAction(fd);
  };

  const handleCreate = async () => {
    if (!createAction) return;
    const name = prompt("Name your new oasis:", "New Oasis") ?? "New Oasis";
    const fd = new FormData();
    fd.append("name", name);
    await createAction(fd);
  };

  const selectedOasis = instances.find((i) => i.id === selectedId);

  return (
    <div className="relative min-h-screen w-full">
      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="mx-auto mt-6 flex w-[min(95vw,72rem)] items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Edit Map
            </h1>
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
      </header>

      {/* Toolbar + Canvas */}
      <main className="relative z-10 mx-auto my-6 w-[min(95vw,72rem)] flex flex-col gap-4">
        {/* Toolbar */}
        <div className="p-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20">
          {selectedId ? (
            <>
              <span className="text-sm text-gray-100">
                Selected: <code>{selectedOasis?.title ?? selectedId}</code>
              </span>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-300 mr-1">Move</span>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => nudgeScreen(-0.5, 0)}
                >
                  ←
                </button>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => nudgeScreen(0.5, 0)}
                >
                  →
                </button>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => nudgeScreen(0, 0.5)}
                >
                  ↓
                </button>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => nudgeScreen(0, -0.5)}
                >
                  ↑
                </button>
              </div>

              <div className="flex items-center gap-1 ml-3">
                <span className="text-sm text-gray-300 mr-1">Rotate</span>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => rotateY((15 * Math.PI) / 180)}
                >
                  ⟳
                </button>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => rotateY((-15 * Math.PI) / 180)}
                >
                  ⟲
                </button>
              </div>

              <div className="flex items-center gap-1 ml-3">
                <span className="text-sm text-gray-300 mr-1">Scale</span>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => scaleBy(1.1)}
                >
                  +
                </button>
                <button
                  className="px-2 py-1 rounded border border-white/20 bg-white/20 text-white"
                  onClick={() => scaleBy(1 / 1.1)}
                >
                  −
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {createAction && (
                  <button
                    onClick={handleCreate}
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200"
                  >
                    ➕ Create New Oasis (DB)
                  </button>
                )}
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200"
                  disabled={!selectedId}
                >
                  Delete Selected (DB)
                </button>
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-sm text-gray-300">
                Tip: Select an oasis, then click the sand to reposition. Use
                the controls to move/rotate/scale.
              </div>
              {createAction && (
                <button
                  onClick={handleCreate}
                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200"
                >
                  ➕ Create New Oasis (DB)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Map Canvas */}
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="h-[70vh] relative">
            <Canvas shadows camera={{ position: [9, 7, 9], fov: 46 }}>
              <color attach="background" args={["#87CEEB"]} />
              <fog attach="fog" args={["#87CEFA", 30, 150]} />

              <Environment preset="sunset" />

              <ambientLight intensity={0.35} />
              <directionalLight
                position={[10, 12, 6]}
                intensity={1.2}
                castShadow
              />
              <directionalLight position={[-10, 6, -6]} intensity={0.25} />

              <Suspense
                fallback={
                  <Html center style={{ color: "white" }}>
                    Loading sand…
                  </Html>
                }
              >
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

              <Suspense
                fallback={
                  <Html center style={{ color: "white" }}>
                    Loading oases…
                  </Html>
                }
              >
                {instances.map((o) => (
                  <OasisInstance
                    key={o.id}
                    data={o}
                    isSelected={o.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </Suspense>

              <ContactShadows
                scale={50}
                blur={2.4}
                opacity={0.5}
                far={15}
              />

              <ControlsWithLimits controlsRef={controlsRef} bounds={bounds} />
            </Canvas>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-black/6 to-black/40 z-5" />

            <GlideControlsUI controlsRef={controlsRef} bounds={bounds} />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Main Page Component ---------------- */
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
  const [isMounted, setIsMounted] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const bounds = { minX: -30, maxX: 30, minZ: -50, maxZ: 25 };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const savedById = loadSaved();
    const defaults = computeDefaultTransforms(wordlists);

    const merged = wordlists.map((wl) => {
      const s = savedById[wl.id];
      return s
        ? { ...s, title: wl.title }
        : (defaults.find((d) => d.id === wl.id) as Oasis3D);
    });

    setInstances(merged);
  }, [wordlists]);

  useEffect(() => {
    if (!instances.length) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    saveDebounced(instances);
  }, [instances]);

  if (!isMounted) {
    return null;
  }

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    return (
      <MobileListEditView
        wordlists={wordlists}
        selectedLanguage={selectedLanguage}
        deleteAction={deleteAction}
        createAction={createAction}
      />
    );
  }

  return (
    <DesktopMapEditView
      wordlists={wordlists}
      selectedLanguage={selectedLanguage}
      deleteAction={deleteAction}
      createAction={createAction}
      instances={instances}
      setInstances={setInstances}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      controlsRef={controlsRef}
      bounds={bounds}
    />
  );
}

useGLTF.preload(DESERT_URL);
useGLTF.preload(OASIS_URL);
