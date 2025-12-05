"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

type CamelMood = "thinking" | "talking" | "mad" | "idle";

type CamelIconProps = {
  mood: CamelMood;
  size?: number;
};

function CamelModel({ mood }: { mood: CamelMood }) {
  const modelPath = useMemo(() => {
    switch (mood) {
      case "thinking":
        return "/blenderModels/camelThink.glb";
      case "talking":
        return "/blenderModels/camelTalk.glb";
      case "mad":
        return "/blenderModels/camelMad.glb";
      default:
        return "/blenderModels/camelIdle.glb";
    }
  }, [mood]);

  const { scene } = useGLTF(modelPath);

  return (
    <primitive
      object={scene}
      scale={1.2}
      position={[0, -0.6, 0]}
      rotation={[0, Math.PI / 8, 0]}
    />
  );
}


export default function CamelIcon({
  mood,
  size = 96,
}: CamelIconProps) {
  return (
    <div
      className="relative rounded-full overflow-hidden shadow-xl ring-2 ring-amber-700/40 bg-gradient-to-br from-amber-100 to-amber-200"
      style={{ width: size, height: size }}
    >
      <Canvas camera={{ position: [0, 1.3, 3], fov: 35 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={1} />
        <CamelModel mood={mood} />
        <OrbitControls enableZoom={false} enableRotate={false} />
      </Canvas>

      {/* Optional glass highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10" />
    </div>
  );
}
