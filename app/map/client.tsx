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
} from "@react-three/drei";
import { useRouter } from "next/navigation";
import { LinkAsButton } from "../components/LinkAsButton";
import * as THREE from "three";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Vec3 = [number, number, number];

// Lite type for wordlist in supa server
export type WordListLite = {
  id: string;
  title: string;
  language: string | null;
};

// Oasis instance saved to localStorage and rendered into the scene.
// "position" & "rotation" place each oasis; "scale" sets model size.
// "title" is the on‑screen HTML label above the model.
type Oasis3D = {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  title: string;
};

const STORAGE_KEY_3D = "fluentures.oases.3d";

// GLB model URLs
const OASIS_URL = "/blenderModels/oasis2.glb";
const DESERT_URL = "/blenderModels/desertBackground22.glb";

/* ---------------- Mobile List View Component ---------------- */
function MobileListView({
  wordlists,
  router,
}: {
  wordlists: WordListLite[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="mx-auto mt-6 flex w-[min(95vw,72rem)] flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Your Oases
            </h1>
            <p className="text-white/85 text-sm">
              Tap an oasis to explore it
            </p>
          </div>
          <div className="flex gap-2">
            <LinkAsButton
              href="/map/edit"
              className="rounded-lg px-4 py-2 bg-white/90 !text-gray-900 hover:bg-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition"
            >
              Edit Map
            </LinkAsButton>
            <LinkAsButton
              href="/home"
              className="rounded-lg px-4 py-2 bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/30 transition"
            >
              Back
            </LinkAsButton>
          </div>
        </div>
      </header>

      {/* List of Oases */}
      <section className="relative z-10 mx-auto my-6 w-[min(95vw,72rem)]">
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl p-4">
          {wordlists.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-white/70 text-lg">No oases yet</p>
              <p className="text-white/50 text-sm mt-2">
                Create your first oasis to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {wordlists.map((wl) => (
                <button
                  key={wl.id}
                  onClick={() => router.push(`/oasis/${wl.id}`)}
                  className="flex flex-col items-start rounded-xl border border-white/20 bg-white/5 p-4 text-left transition hover:bg-white/10 hover:border-white/30 active:scale-[0.98]"
                >
                  <h3 className="text-white font-semibold text-lg">
                    {wl.title}
                  </h3>
                  {wl.language && (
                    <p className="text-white/60 text-sm mt-1">
                      Language: {wl.language}
                    </p>
                  )}
                  <div className="mt-3 text-white/80 text-sm flex items-center gap-1">
                    <span>Open</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hint */}
      <div className="relative z-10 mx-auto mb-8 w-[min(95vw,72rem)]">
        <p className="text-center text-xs text-white/70">
          💡 The 3D map view is available on desktop devices
        </p>
      </div>
    </div>
  );
}


/* ---------------- Edge-anchorable Desert background (StrictMode-safe) ---------------- */
function DesertBackground({
  position = [0, 0, 0] as Vec3,
  rotation = [0, 0, 0] as Vec3,
  scale = 1,
  targetWidth = 60,
  anchorX = "min", // "min" | "center" | "max"
  anchorZ = "min", // "min" | "center" | "max"
  targetX = -30, // world X for chosen X-edge
  targetZ = -30, // world Z for chosen Z-edge bottom front edge for model
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

    // Optionally rotate before measuring bounds for anchoring
    if (computeWithRotation) {
      clone.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
    clone.updateMatrixWorld(true);

    // Ground to y = 0
    const boxAfterScale = new THREE.Box3().setFromObject(clone);
    clone.position.y += -boxAfterScale.min.y;
    clone.updateMatrixWorld(true);

    // Anchor to requested edges
    const box = new THREE.Box3().setFromObject(clone);
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const currentX = anchorX === "min" ? box.min.x : anchorX === "max" ? box.max.x : centerX;
    const currentZ = anchorZ === "min" ? box.min.z : anchorZ === "max" ? box.max.z : centerZ;

    clone.position.x += targetX - currentX;
    clone.position.z += targetZ - currentZ;

    // External offset
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

/* ---------------- Oasis model & instance ---------------- 
* OasisInstance: clickable wrapper that:
* - draws an invisible, larger hitbox for easier clicking
* - renders the model itself
* - shows a floating HTML label above the model
* Clicking navigates to the oasis detail route via onOpen(id).
*/
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
    </group>
  );
}

/* ---------------- Pan limiter ->frame-based.   ---------------- 
* Runs every frame, clamps OrbitControls.target to a rectangular region so the
* user can't pan the camera outside the intended sand area. If the target is
* clamped, the camera position is shifted by the same offset*/

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

/* ---------------- OrbitControls wrapper ---------------- */
// affects how the camera can be moved 
function ControlsWithLimits({
  controlsRef,
  bounds,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}) {
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableRotate={false} // "glide" feel — no free orbit
        enablePan
        enableZoom
        minDistance={6}
        maxDistance={26}
        minPolarAngle={0.9} // keep camera above horizon
        maxPolarAngle={Math.PI / 2.1}
      />
      <PanLimiter controls={controlsRef} bounds={bounds} />
    </>
  );
}

/* ---------------- Arrow pad  ---------------- */
//* - step: how far each tap tries to move in world units (before clamping)
// - duration: how long the glide animation takes (ms)
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
    // weird changes due to flipping model axis 
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

/* ---------------- Desktop 3D Map View ---------------- */
function DesktopMapView({
  instances,
  router,
  controlsRef,
  bounds,
}: {
  instances: Oasis3D[];
  router: ReturnType<typeof useRouter>;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Header / actions */}
      <header className="relative z-10 w-full">
        <div className="mx-auto mt-6 flex w-[min(95vw,72rem)] items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">Map</h1>
            <p className="text-white/85 text-sm">
              Explore your saved oases in 3D. Click the arrows to explore.
            </p>
          </div>
          <div className="flex gap-2">
            <LinkAsButton
              href="/map/edit"
              className="rounded-lg px-4 py-2 bg-white/90 !text-gray-900 hover:bg-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition"
            >
              Edit Map
            </LinkAsButton>
            <LinkAsButton
              href="/home"
              className="rounded-lg px-4 py-2 bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/30 transition"
            >
              Back
            </LinkAsButton>
          </div>
        </div>
      </header>

      {/* ===== MAP CANVAS ===== */}
      <section className="relative z-10 mx-auto my-6 w-[min(95vw,72rem)]">
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="h-[70vh] relative">
            <Canvas
              shadows
              camera={{ position: [9, 7, 9], fov: 46, near: 0.1, far: 200 }}
            >
              {/* Scene mood */}
              <color attach="background" args={["#AEE6FF"]} />     
              <fog attach="fog" args={["#87CEFA", 30, 150]} />  

              <Environment preset="sunset" />

              {/* Lights */}
              <ambientLight intensity={0.35} />
              <directionalLight
                position={[10, 12, 6]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight position={[-10, 6, -6]} intensity={0.25} />

              {/* GLB background with an edge facing out */}
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

              {/* Model instances */}
              <Suspense fallback={<Html center style={{ color: "white" }}>Loading oases…</Html>}>
                {instances.map((o) => (
                  <OasisInstance key={o.id} data={o} onOpen={(id) => router.push(`/oasis/${id}`)} />
                ))}
              </Suspense>

              {/* Soft contact shadows */}
              <ContactShadows position={[0, 0, 0]} scale={50} blur={2.4} opacity={0.5} far={15} />

              {/* Controls + pan limits */}
              <ControlsWithLimits controlsRef={controlsRef} bounds={bounds} />
            </Canvas>
            {/* Gradient overlay for contrast */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/40 z-5" />

            {/* Arrow pad overlay outside map canvas */}
            <GlideControlsUI controlsRef={controlsRef} bounds={bounds} />
          </div>
        </div>
      </section>

      {/* Tiny footer hint */}
      <div className="relative z-10 mx-auto mb-8 w-[min(95vw,72rem)]">
        <p className="text-center text-xs text-white/70">
          Tip: Use the arrow pad to glide. Scroll to zoom. Click an oasis to open it.
        </p>
      </div>

      {/* Local keyframes for floating blobs */}
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

/* ---------------- Main Page Component with Mobile Detection ---------------- */
export default function MapView({
  wordlists,
}: {
  wordlists: WordListLite[];
  selectedLanguage: string | null;
}) {
  const router = useRouter();
  const [instances, setInstances] = useState<Oasis3D[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Travel limits
  const bounds = { minX: -30, maxX: 30, minZ: -50, maxZ: 25 };

  // Track when component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge Supabase wordlists with any saved localStorage layout
  useEffect(() => {
    // Only load 3D data on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    
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
            position: [ (i % 5) * 6 - 12, 0, Math.floor(i / 5) * -6 ] as Vec3,
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
          position: [ (i % 5) * 6 - 12, 0, Math.floor(i / 5) * -6 ] as Vec3,
          rotation: [0, 0, 0],
          scale: 1,
        }))
      );
    }
  }, [wordlists]);

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Check if mobile - must be done after mount
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Render mobile list view or desktop 3D map
  if (isMobile) {
    return <MobileListView wordlists={wordlists} router={router} />;
  }

  return (
    <DesktopMapView
      instances={instances}
      router={router}
      controlsRef={controlsRef}
      bounds={bounds}
    />
  );
}

useGLTF.preload(OASIS_URL);
useGLTF.preload(DESERT_URL);