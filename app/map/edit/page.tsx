// app/map/edit/page.tsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
<<<<<<< HEAD
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
=======
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
import { motion, type Variants } from "framer-motion";
import { LinkAsButton } from "../../components/LinkAsButton";
import CreateTestOasisButton from "./CreateOasisAndEditButton";



type Vec3 = [number, number, number];

type Oasis3D = {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  title: string;
};

type Packet = {
  id: string;
  title: string;
  createdAt: number;
};

const STORAGE_KEY_3D = "fluentures.oases.3d";
const STORAGE_KEY_PACKETS = "fluentures.packets";

<<<<<<< HEAD
// Your assets
const OASIS_URL = "/blenderModels/oasis2.glb";
const DESERT_URL = "/blenderModels/desertBackground22.glb";

/* ---------------- Desert background 3D model (GLB) ---------------- */
function DesertBackground({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  targetWidth,
}: {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  targetWidth?: number;
}) {
  const { scene } = useGLTF(DESERT_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    // measure unscaled
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.setScalar(1);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const baseWidth = box.getSize(new THREE.Vector3()).x;

    // uniform scale to fit target
    const s = targetWidth && baseWidth > 0 ? (targetWidth / baseWidth) * scale : scale;
    clone.scale.setScalar(s);
    clone.updateMatrixWorld(true);

    // after scaling, snaps to the bottom y axis
    const box2 = new THREE.Box3().setFromObject(clone);
    clone.position.y += -box2.min.y;

    clone.updateMatrixWorld(true);
  }, [clone, scale, targetWidth]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clone} />
    </group>
  );
=======
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `oasis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function autoPosition(index: number): Vec3 {
  const spacing = 3;
  const cols = 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return [col * spacing, 0, row * spacing] as Vec3;
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
}

/* ---------------- Models & Instances ---------------- */
function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(OASIS_URL, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}

// Invisible plane used ONLY for click-to-place, not for visuals
function Ground({ onPlace }: { onPlace: (point: Vec3) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
<<<<<<< HEAD
      position={[0, 0.02, 0]}
=======
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
      onClick={(e) => {
        e.stopPropagation();
        const p = e.point;
        onPlace([p.x, 0, p.z]);
      }}
      receiveShadow
      visible={false}
    >
<<<<<<< HEAD
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial transparent opacity={0} />
=======
      {/* Big plane you can click to place */}
      <planeGeometry args={[220, 220]} />
      {/* Warm, sandy tone */}
      <meshStandardMaterial color="#efe5d1" />
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
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
  const [hovered, setHovered] = useState(false);

  // Gentle bob + selection pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
<<<<<<< HEAD
    const bobStrength = 0.03;
    const scaleLift = hovered ? 1.04 : 1.0;
    if (groupRef.current) {
      const baseY = data.position[1] ?? 0;
      groupRef.current.position.set(
        data.position[0],
        baseY + Math.sin(t * 1.2) * bobStrength,
        data.position[2]
      );
=======
    const bobStrength = 0.03; // set to 0 to disable bob
    const scaleLift = hovered ? 1.04 : 1.0;
    if (groupRef.current) {
      const baseY = data.position[1];
      groupRef.current.position.y = baseY + Math.sin(t * 1.2) * bobStrength;
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
      groupRef.current.scale.setScalar(data.scale * scaleLift);
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isSelected ? 0.35 + Math.sin(t * 3) * 0.15 : 0.0;
    }
  });

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible hit box for easier selection */}
      <mesh position={[0, 1.0 * data.scale, 0]} visible={false}>
        <boxGeometry args={[2 * data.scale, 2 * data.scale, 2 * data.scale]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <OasisModel scale={data.scale} />

      {/* Floating label */}
      <Html
        position={[0, 1.65 * data.scale, 0]}
        center
        style={{
          pointerEvents: "none",
          background: "rgba(255,255,255,0.85)",
          padding: "4px 8px",
          borderRadius: 10,
          fontSize: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        }}
      >
        {data.title}
      </Html>

      {/* Pulsing selection ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.95 * data.scale, 1.25 * data.scale, 48]} />
<<<<<<< HEAD
        <meshBasicMaterial color="#ffffff" transparent opacity={0.0} />
=======
        <meshBasicMaterial color="#0f766e" transparent opacity={0.0} />
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
      </mesh>
    </group>
  );
}

<<<<<<< HEAD

/* ---------------- UI animation ---------------- */
=======
/* ---------------- UI animation ---------------- */

>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
const panelIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0)",
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

<<<<<<< HEAD
/* ---------------- Helpers ---------------- */
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `oasis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function autoPosition(index: number): Vec3 {
  const spacing = 3;
  const cols = 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return [col * spacing, 0, row * spacing] as Vec3;
}

/* ---------------- Page ---------------- */
=======
/* ---------------- Page ---------------- */

>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
export default function EditPage() {
  const [instances, setInstances] = useState<Oasis3D[]>([]);
  const [packets, setPackets] = useState<Record<string, Packet>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [mounted, setMounted] = useState(false);

  // Load state
  useEffect(() => {
    try {
      const raw3d = localStorage.getItem(STORAGE_KEY_3D);
      if (raw3d) setInstances(JSON.parse(raw3d));
      const rawPackets = localStorage.getItem(STORAGE_KEY_PACKETS);
      if (rawPackets) setPackets(JSON.parse(rawPackets));
    } catch (e) {
      console.warn("Failed to load state", e);
    }
    setMounted(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_3D, JSON.stringify(instances));
      localStorage.setItem(STORAGE_KEY_PACKETS, JSON.stringify(packets));
    } catch (e) {
      console.warn("Failed to save state", e);
    }
  }, [instances, packets, mounted]);

  // Keyboard: Delete key removes selected
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, instances.length]);

  const addOasis = () => {
    const id = makeId();
    const title = `Oasis ${instances.length + 1}`;
    const createdAt = Date.now();
    const position = autoPosition(instances.length);

    const packet: Packet = { id, title, createdAt };
    const instance: Oasis3D = {
      id,
      title,
      position,
      rotation: [0, 0, 0],
      scale,
    };

    setPackets((prev) => ({ ...prev, [id]: packet }));
    setInstances((prev) => [instance, ...prev]);
    setSelectedId(id);
  };

  const placeOasisAtPoint = (point: Vec3) => {
    const id = makeId();
    const title = `Oasis ${instances.length + 1}`;
    const createdAt = Date.now();

    const packet: Packet = { id, title, createdAt };
    const instance: Oasis3D = {
      id,
      title,
      position: point,
      rotation: [0, 0, 0],
      scale,
    };

    setPackets((prev) => ({ ...prev, [id]: packet }));
    setInstances((prev) => [instance, ...prev]);
    setSelectedId(id);
  };

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setInstances((prev) => prev.filter((o) => o.id !== selectedId));
    setPackets((prev) => {
      const copy = { ...prev };
      delete copy[selectedId];
      return copy;
    });
    setSelectedId(null);
  }, [selectedId]);

  const clearAll = () => {
    setInstances([]);
    setPackets({});
    setSelectedId(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ---------- Animated background like other pages ---------- */}
      <motion.img
        src="/desert.png"
        alt="Desert background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft gradient/dim for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      {/* Glow blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.30), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, 16, 0], x: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.22), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, -14, 0], x: [0, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ---------- UI Shell ---------- */}
      <header className="relative z-10">
        <motion.div
          variants={panelIn}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 w-[min(92vw,80rem)] rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-4 shadow-2xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Edit Map
              </h1>
              <p className="text-sm text-white/90">
<<<<<<< HEAD
                Click the desert to place an oasis · Select one and press{" "}
=======
                Click the ground to place an oasis · Select one and press{" "}
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
                <kbd className="rounded bg-white/20 px-1">Del</kbd> to remove
              </p>
            </div>

            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <CreateTestOasisButton />

=======
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
              <LinkAsButton
                href="/map"
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 px-4 py-2 shadow-md ring-1 ring-white/40 transition"
              >
                Done
              </LinkAsButton>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto mt-4 w-[min(92vw,80rem)] space-y-4">
        {/* Controls */}
        <motion.section
          variants={panelIn}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-white/30 bg-white/35 backdrop-blur-xl p-4 shadow-xl"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            {/* Scale */}
            <div>
              <label className="block text-sm font-semibold text-white">
                Scale (for new oases)
              </label>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="mt-2 w-56 accent-emerald-700"
              />
              <div className="mt-1 text-xs text-white/90">{scale.toFixed(2)}×</div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addOasis}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition active:scale-[0.98]"
                title="Add an oasis on the grid"
              >
                ➕ Add Oasis
              </button>

              <button
                onClick={removeSelected}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-400 shadow-md transition disabled:opacity-50 active:scale-[0.98]"
                disabled={!selectedId}
              >
                🗑 Delete Selected
              </button>

              <button
                onClick={clearAll}
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-white/80 hover:bg-white shadow-md ring-1 ring-black/10 transition disabled:opacity-50 active:scale-[0.98]"
                disabled={!instances.length}
              >
                ✨ Clear All
              </button>
            </div>
<<<<<<< HEAD
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addOasis}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition active:scale-[0.98]"
                title="Add an oasis on the grid"
              >
                ➕ Add Oasis
              </button>

              <button
                onClick={removeSelected}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-400 shadow-md transition disabled:opacity-50 active:scale-[0.98]"
                disabled={!selectedId}
              >
                🗑 Delete Selected
              </button>

              <button
                onClick={clearAll}
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-white/80 hover:bg-white shadow-md ring-1 ring-black/10 transition disabled:opacity-50 active:scale-[0.98]"
                disabled={!instances.length}
              >
                ✨ Clear All
              </button>
            </div>
          </div>
        </motion.section>

        {/* Canvas panel */}
=======
          </div>
        </motion.section>

        {/* Canvas */}
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
        <motion.section
          variants={panelIn}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl shadow-2xl"
        >
          <div className="relative h-[72vh]">
<<<<<<< HEAD
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.18)]" />
            <Canvas shadows camera={{ position: [10, 8, 10], fov: 46, near: 0.1, far: 200 }}>
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

              {/* Your GLB desert */}
              <Suspense fallback={<Html center style={{ color: "white" }}>Loading sand…</Html>}>
                <DesertBackground position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} targetWidth={60} />
              </Suspense>

              {/* Invisible placement plane */}
              <Ground onPlace={placeOasisAtPoint} />

              {/* Oases */}
=======
            {/* subtle vignette */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.18)]" />
            <Canvas shadows camera={{ position: [8, 8, 8], fov: 46 }}>
              {/* soft background inside canvas */}
              <color attach="background" args={["#f8f6ef"]} />
              <ambientLight intensity={0.65} />
              <directionalLight
                position={[10, 12, 6]}
                intensity={1.1}
                castShadow
                shadow-mapSize={[2048, 2048]}
              />

              <Ground onPlace={placeOasisAtPoint} />

>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
              <Suspense fallback={null}>
                {instances.map((o) => (
                  <OasisInstance
                    key={o.id}
                    data={o}
                    isSelected={o.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </Suspense>

<<<<<<< HEAD
              {/* Shadows + controls */}
              <ContactShadows position={[0, 0, 0]} scale={50} blur={2.4} opacity={0.5} far={15} />
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={4}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.05}
              />
=======
              <OrbitControls makeDefault />
>>>>>>> 4ebb74fb991dee3e1cfc2538fea7376cbc4e2795
            </Canvas>
          </div>
        </motion.section>
      </main>
    </div>
  );
}


useGLTF.preload(OASIS_URL);
useGLTF.preload(DESERT_URL);
