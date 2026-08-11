"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelViewer({ url }) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-rule bg-surface">
      <Canvas camera={{ position: [3, 2, 3], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Model url={url} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={0.8} enableZoom={true} />
      </Canvas>
    </div>
  );
}
