"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { LinkAsButton } from "../../components/LinkAsButton";

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
const MODEL_URL = "/oasis.glb";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `oasis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Simple grid to avoid overlap for the Add button
function autoPosition(index: number): Vec3 {
  const spacing = 3;
  const cols = 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return [col * spacing, 0, row * spacing] as Vec3;
}

function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(MODEL_URL, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}

function Ground({ onPlace }: { onPlace: (point: Vec3) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const p = e.point;
        onPlace([p.x, 0, p.z]);
      }}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#f0f2f5" />
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
  const groupRef = useRef<any>(null);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id); // select only; no navigation in edit mode
      }}
    >
      {/* bigger hit box for easy selection */}
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
          background: "rgba(255,255,255,0.8)",
          padding: "2px 6px",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        {data.title}
      </Html>

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.9 * data.scale, 1.2 * data.scale, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

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

  // Add via grid
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

  // Click-to-place exact position
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

  const removeSelected = () => {
    if (!selectedId) return;
    setInstances((prev) => prev.filter((o) => o.id !== selectedId));
    setPackets((prev) => {
      const copy = { ...prev };
      delete copy[selectedId];
      return copy;
    });
    setSelectedId(null);
  };

  const clearAll = () => {
    setInstances([]);
    setPackets({});
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 py-6 px-4">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Edit Map</h1>
        <div className="flex gap-2">
          <LinkAsButton href="/map" className="btn">Done</LinkAsButton>
        </div>
      </header>

      <section className="w-full max-w-6xl mx-auto rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-medium">Scale (for new oases)</label>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-48"
            />
            <div className="text-xs text-gray-600 mt-1">{scale.toFixed(2)}x</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addOasis}
              className="rounded-xl px-3 py-2 text-sm font-medium border border-sky-200 text-sky-700 hover:bg-sky-50"
            >
              Add Oasis
            </button>
            <button
              onClick={removeSelected}
              className="rounded-xl px-3 py-2 text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
              disabled={!selectedId}
            >
              Delete selected
            </button>
            <button
              onClick={clearAll}
              className="rounded-xl px-3 py-2 text-sm font-medium border border-gray-200 hover:bg-gray-50"
              disabled={!instances.length}
            >
              Clear all
            </button>
          </div>

          <p className="text-xs text-gray-600">
            Tip: Click the ground to place a new oasis at an exact location.
          </p>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-[70vh]">
          <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 12, 6]} intensity={1.0} castShadow />

            <Ground onPlace={placeOasisAtPoint} />

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

            <OrbitControls makeDefault />
          </Canvas>
        </div>
      </section>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
