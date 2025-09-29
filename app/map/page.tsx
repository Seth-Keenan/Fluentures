"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { LinkAsButton } from "../components/LinkAsButton";

type Vec3 = [number, number, number];

type Oasis3D = {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  title: string;
};

const STORAGE_KEY_3D = "fluentures.oases.3d";
const MODEL_URL = "/oasis.glb";

function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(MODEL_URL, true);
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
  const groupRef = useRef<any>(null);
  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(data.id); // behave like a button → open packet
      }}
    >
      {/* larger hit box for easy clicks */}
      <mesh position={[0, 1.0 * data.scale, 0]} visible={false}>
        <boxGeometry args={[2 * data.scale, 2 * data.scale, 2 * data.scale]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <OasisModel scale={data.scale} />

      {/* Label */}
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
    </group>
  );
}

export default function Page() {
  const router = useRouter();
  const [instances, setInstances] = useState<Oasis3D[]>([]);

  // Load instances only (view mode doesn't modify them)
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

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 py-6 px-4">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
        <div className="flex gap-2">
          <LinkAsButton href="/map/edit" className="btn">Edit Map</LinkAsButton>
          <LinkAsButton href="/home" className="btn">Back</LinkAsButton>
        </div>
      </header>

      <section className="w-full max-w-6xl mx-auto rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-[70vh]">
          <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 12, 6]} intensity={1.0} castShadow />

            <Suspense fallback={null}>
              {instances.map((o) => (
                <OasisInstance key={o.id} data={o} onOpen={openPacket} />
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
