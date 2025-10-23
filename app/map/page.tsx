"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
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

// Oasis instance saved to localStorage and rendered into the scene.
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

/* ---------------- Oasis model & instance ---------------- */
function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(OASIS_URL, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}

function OasisInstance({
  data,
  onOpen,
  onHover,
}: {
  data: Oasis3D;
  onOpen: (id: string) => void;
  onHover: (hovering: boolean) => void;
}) {
  const groupRef = useRef<Group>(null!);

  const handleOpen = useCallback(
    (e?: any) => {
      e?.stopPropagation?.();
      onOpen(data.id);
    },
    [data.id, onOpen]
  );

  return (
    <group
      ref={groupRef}
      position={[data.position[0], data.position[1] ?? 0, data.position[2]]}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        handleOpen(e);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(false);
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
        transform={false}
        style={{
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.9)",
          padding: "6px 10px",
          borderRadius: 10,
          fontSize: 12,
          color: "#111",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          whiteSpace: "nowrap",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen();
            }
          }}
          aria-label={`Open oasis ${data.title}`}
          className="rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            font: "inherit",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          {data.title}
        </button>
      </Html>
    </group>
  );
}

/* ---------------- Pan limiter ---------------- */
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

/* ---------------- Arrow pad (screen glide) ---------------- */
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
      Math.min(bounds.maxZ, Math.max(bounds.minZ, unclampedTo.z))
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

/* ---------------- Page ---------------- */
export default function Page() {
  const router = useRouter();

  // ✅ Hooks live INSIDE the component — not at module scope
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const bounds = useMemo(
    () => ({ minX: -30, maxX: 30, minZ: -30, maxZ: 30 }),
    []
  );

  const [instances, setInstances] = useState<Oasis3D[]>([]);
  const [hoveringOasis, setHoveringOasis] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const raw3d = localStorage.getItem(STORAGE_KEY_3D);
      if (raw3d) setInstances(JSON.parse(raw3d));
    } catch (e) {
      console.warn("Failed to load oases", e);
    }
  }, []);

  const openPacket = (id: string) => {
    router.push(`/oasis?id=${id}`);
  };

  // Decide canvas cursor state
  const canvasCursor = dragging ? "grabbing" : hoveringOasis ? "pointer" : "grab";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image & glow blobs */}
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
              className="!cursor-pointer rounded-lg px-4 py-2 bg-white/90 !text-gray-900 hover:bg-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition"
            >
              Edit Map
            </LinkAsButton>
            <LinkAsButton
              href="/home"
              className="!cursor-pointer rounded-lg px-4 py-2 bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/30 transition"
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
              camera={{ position: [10, 8, 10], fov: 46, near: 0.1, far: 200 }}
              style={{ cursor: canvasCursor }}
              onPointerMissed={() => setHoveringOasis(false)}
            >
              {/* Scene mood */}
              <color attach="background" args={["#000000"]} />
              <fog attach="fog" args={["#000000", 35, 120]} />

              {/* Sun & environment */}
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

              {/* Ground (soft sand) */}
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
                onPointerOver={() => setHoveringOasis(false)}
              >
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#e8d9b3" roughness={0.95} />
              </mesh>

              {/* Background model */}
              <Suspense fallback={<Html center style={{ color: "white" }}>Loading…</Html>}>
                <DesertBackground
                  position={[0, 0, 0]}
                  rotation={[0, Math.PI * 0.25, 0]}
                  scale={1}
                  targetWidth={100}
                  anchorX="min"
                  anchorZ="min"
                  targetX={-50}
                  targetZ={-50}
                />
              </Suspense>

              {/* Model instances */}
              <Suspense fallback={<Html center style={{ color: "white" }}>Loading oases…</Html>}>
                {instances.map((o) => (
                  <OasisInstance
                    key={o.id}
                    data={o}
                    onOpen={(id) => router.push(`/oasis?id=${id}`)}
                    onHover={(h) => setHoveringOasis(h)}
                  />
                ))}
              </Suspense>

              {/* Soft contact shadows */}
              <ContactShadows position={[0, 0, 0]} scale={50} blur={2.4} opacity={0.5} far={15} />

              {/* Controls */}
              <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={4}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.05}
                autoRotate
                autoRotateSpeed={0.6}
                onStart={() => setDragging(true)}
                onEnd={() => setDragging(false)}
              />

              {/* Optional: keep camera target within bounds */}
              <PanLimiter controls={controlsRef} bounds={bounds} />
            </Canvas>

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

// These are fine to call at module scope; they are not React hooks.
useGLTF.preload(OASIS_URL);
useGLTF.preload(DESERT_URL);
