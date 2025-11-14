// app/map/MapViewClient.tsx
"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  ContactShadows,
  Environment,
  Sky,
} from "@react-three/drei";
import { useRouter } from "next/navigation";
import { LinkAsButton } from "../components/LinkAsButton";
import * as THREE from "three";
import type { Group } from "three";
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

const OASIS_URL = "/blenderModels/oasis2.glb";
const DESERT_URL = "/blenderModels/desertBackground22.glb";

/* ---------------- Desert background ---------------- */

function DesertBackground({
  position = [0, 0, 0] as Vec3,
  rotation = [0, 0, 0] as Vec3,
  scale = 1,
  targetWidth = 60,
  anchorX = "min",
  anchorZ = "min",
  targetX = -30,
  targetZ = -30,
  computeWithRotation = true,
}: {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  targetWidth?: number;
  anchorX?: "min" | "center" | "max";
  anchorZ?: "min" | "center" | "max";
  targetX?: number;
  targetZ?: number;
  computeWithRotation?: boolean;
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
    const s = authoredSize.x > 0 ? (targetWidth / authoredSize.x) * scale : scale;
    clone.scale.setScalar(s);

    if (computeWithRotation) {
      clone.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
    clone.updateMatrixWorld(true);

    const boxAfterScale = new THREE.Box3().setFromObject(clone);
    clone.position.y += -boxAfterScale.min.y;
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const currentX = anchorX === "min" ? box.min.x : anchorX === "max" ? box.max.x : centerX;
    const currentZ = anchorZ === "min" ? box.min.z : anchorZ === "max" ? box.max.z : centerZ;

    clone.position.x += targetX - currentX;
    clone.position.z += targetZ - currentZ;

    clone.position.x += position[0];
    clone.position.y += position[1];
    clone.position.z += position[2];

    clone.updateMatrixWorld(true);
  }, [clone, scale, targetWidth, rotation, anchorX, anchorZ, targetX, targetZ, position, computeWithRotation]);

  return (
    <group rotation={computeWithRotation ? [0, 0, 0] : rotation}>
      <primitive object={clone} />
    </group>
  );
}

/* ---------------- Oasis model & instance ---------------- */

function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(OASIS_URL, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}

function OasisInstance({
  data,
  onOpen,
}: {
  data: Oasis3D;
  onOpen: (id: string) => void;
}) {
  const groupRef = useRef<Group>(null!);
  return (
    <group
      ref={groupRef}
      position={[data.position[0], data.position[1] ?? 0, data.position[2]]}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(data.id);
      }}
    >
      <mesh position={[0, 1.0 * data.scale, 0]} visible={false}>
        <boxGeometry args={[2 * data.scale, 2 * data.scale, 2 * data.scale]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <OasisModel scale={data.scale} />

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

/* ---------------- Arrow pad ---------------- */

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

/* ---------------- Main client component ---------------- */

type MapViewProps = {
  wordlists: WordListLite[];
  selectedLanguage: string | null;
  createAction?: (fd: FormData) => Promise<void>;
};

export default function MapView({
  wordlists,
  selectedLanguage,
  createAction,
}: MapViewProps) {
  const router = useRouter();
  const [instances, setInstances] = useState<Oasis3D[]>([]);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const bounds = { minX: -30, maxX: 30, minZ: -50, maxZ: 25 };

  const handleOpen = (id: string) => {
    router.push(`/oasis/${id}`);
  };

  const handleCreate = async () => {
    if (!createAction) return;
    const name =
      typeof window !== "undefined"
        ? (prompt("Name your new oasis:", "New Oasis") ?? "New Oasis")
        : "New Oasis";
    const fd = new FormData();
    fd.append("name", name);
    await createAction(fd); // server will redirect
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_3D);
      const saved: Oasis3D[] = raw ? JSON.parse(raw) : [];
      const savedById = new Map(saved.map((s) => [s.id, s]));

      const merged: Oasis3D[] = wordlists.map((wl, i) => {
        const found = savedById.get(wl.id);
        return (
          found ?? {
            id: wl.id,
            title: wl.title,
            position: [(i % 5) * 6 - 12, 0, Math.floor(i / 5) * -6] as Vec3,
            rotation: [0, 0, 0],
            scale: 1,
          }
        );
      });

      setInstances(merged);
    } catch (e) {
      console.warn("Failed to merge oases from storage", e);
      setInstances(
        wordlists.map((wl, i) => ({
          id: wl.id,
          title: wl.title,
          position: [(i % 5) * 6 - 12, 0, Math.floor(i / 5) * -6] as Vec3,
          rotation: [0, 0, 0],
          scale: 1,
        })),
      );
    }
  }, [wordlists]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image & glow blobs */}
      <img
        src="/desert.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
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

      {/* 📱 Mobile list view */}
      <div className="relative z-10 block sm:hidden px-4 pt-6 pb-8">
        <header className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-white">Your oases</h1>
              <p className="text-xs text-white/70">
                Tap an oasis to open it.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 ring-1 ring-white/20">
              <span className="mr-1 opacity-75">Language:</span>
              <strong>{selectedLanguage ?? "Any"}</strong>
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium shadow-md shadow-black/20 ring-1 ring-slate-200 active:translate-y-[1px] active:shadow-sm transition"
            >
              Create oasis
            </button>
            <LinkAsButton
              href="/home"
              className="flex-1 rounded-lg bg-white/5 text-white px-4 py-2 text-sm ring-1 ring-white/20"
            >
              Back
            </LinkAsButton>
          </div>
        </header>

        {wordlists.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/85 ring-1 ring-white/20">
            {selectedLanguage ? (
              <>
                No oases yet for <strong>{selectedLanguage}</strong>.{" "}
                <span className="opacity-80">
                  Create one to start learning.
                </span>
              </>
            ) : (
              <>You don&apos;t have any oases yet. Create one to get started.</>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {wordlists.map((oasis) => (
              <button
                key={oasis.id}
                type="button"
                onClick={() => handleOpen(oasis.id)}
                className="w-full rounded-xl bg-white text-slate-900 px-4 py-3 text-left shadow-md shadow-black/20 ring-1 ring-slate-200 active:translate-y-[1px] active:shadow-sm transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {oasis.title}
                    </div>
                    {oasis.language && (
                      <div className="mt-0.5 text-[11px] text-slate-600">
                        {oasis.language}
                      </div>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-medium text-slate-700">
                    Open
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 💻 Desktop / tablet 3D map */}
      <div className="hidden sm:block">
        {/* Header / actions */}
        <header className="relative z-10 w-full">
          <div className="mx-auto mt-6 flex w-[min(95vw,72rem)] items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-semibold">
                Map
              </h1>
              <p className="text-white/85 text-sm">
                Explore your saved oases in 3D. Click the arrows to explore.
              </p>
              {selectedLanguage && (
                <p className="mt-1 text-xs text-white/70">
                  Language:{" "}
                  <span className="font-semibold">{selectedLanguage}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-lg px-4 py-2 bg-white/90 text-gray-900 hover:bg-white shadow-lg shadow-black/20 ring-1 ring-white/30 text-sm font-medium transition"
              >
                Create oasis
              </button>
              <LinkAsButton
                href="/home"
                className="rounded-lg px-4 py-2 bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/30 transition"
              >
                Back
              </LinkAsButton>
            </div>
          </div>
        </header>

        {/* 3D Canvas card */}
        <section className="relative z-10 mx-auto my-6 w-[min(95vw,72rem)]">
          <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="h-[70vh] relative">
              <Canvas
                shadows
                camera={{ position: [9, 7, 9], fov: 46, near: 0.1, far: 200 }}
              >
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
                <directionalLight
                  position={[10, 12, 6]}
                  intensity={1.2}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
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

                <Suspense
                  fallback={
                    <Html center style={{ color: "white" }}>
                      Loading oases…
                    </Html>
                  }
                >
                  {instances.map((o) => (
                    <OasisInstance key={o.id} data={o} onOpen={handleOpen} />
                  ))}
                </Suspense>

                <ContactShadows
                  position={[0, 0, 0]}
                  scale={50}
                  blur={2.4}
                  opacity={0.5}
                  far={15}
                />

                <ControlsWithLimits controlsRef={controlsRef} bounds={bounds} />
              </Canvas>

              <GlideControlsUI controlsRef={controlsRef} bounds={bounds} />
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto mb-8 w-[min(95vw,72rem)]">
          <p className="text-center text-xs text-white/70">
            Tip: Use the arrow pad to glide. Scroll to zoom. Click an oasis to
            open it.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float1 {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(10px, 14px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        @keyframes float2 {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-12px, -12px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}

useGLTF.preload(OASIS_URL);
useGLTF.preload(DESERT_URL);
