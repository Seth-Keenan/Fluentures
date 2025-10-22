// app/map/page.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
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
import type { Group } from "three";

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

/* -------------------- 3D Model -------------------- */
function OasisModel({ scale = 1 }: { scale?: number }) {
  const gltf = useGLTF(MODEL_URL, true);
  // Clone to avoid shared mutations between instances
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={scene} scale={scale} />;
}
const TEST_ID = "11111111-1111-1111-1111-111111111111";

/* -------------------- Instance (clickable) -------------------- */
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
      position={data.position}
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

/* -------------------- Page -------------------- */
export default function Page() {
  const router = useRouter();
  const [instances, setInstances] = useState<Oasis3D[]>([]);

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with gentle zoom */}
      <img
        src="/desert.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dim gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
      {/* Ambient glow blobs */}
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
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Map
            </h1>
            <p className="text-white/85 text-sm">
              Explore your saved oases in 3D. Drag, zoom, and click to open.
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

      {/* 3D Canvas card */}
      <section className="relative z-10 mx-auto my-6 w-[min(95vw,72rem)]">
        <div className="rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="h-[70vh]">
            <Canvas
              shadows
              camera={{ position: [10, 8, 10], fov: 46, near: 0.1, far: 200 }}
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
              >
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#e8d9b3" roughness={0.95} />
              </mesh>

              {/* Model instances */}
              <Suspense
                fallback={
                  <Html center style={{ color: "white" }}>
                    Loading oases…
                  </Html>
                }
              >
                {instances.map((o) => (
                  <OasisInstance key={o.id} data={o} onOpen={openPacket} />
                ))}
              </Suspense>

              {/* Soft contact shadows */}
              <ContactShadows
                position={[0, 0, 0]}
                scale={50}
                blur={2.4}
                opacity={0.5}
                far={15}
              />

              {/* Controls */}
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={4}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.05}
                autoRotate
                autoRotateSpeed={0.6}
              />
            </Canvas>
          </div>
        </div>
      </section>

      {/* Tiny footer hint */}
      <div className="relative z-10 mx-auto mb-8 w-[min(95vw,72rem)]">
        <p className="text-center text-xs text-white/70">
          Tip: Hold <span className="font-semibold">right-click</span> to pan,
          scroll to zoom, and click an oasis to open it.
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

useGLTF.preload(MODEL_URL);
