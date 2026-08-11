"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// Bounding radius of the torus knot below, in local units. Used to fit the
// object to whatever space the canvas actually has.
const OBJECT_RADIUS = 1.8;

/**
 * Scales its children so the object always fits inside the canvas, whatever
 * that canvas's shape is. Fitting to the *smaller* of width/height is what
 * keeps it whole in a narrow column as well as a wide one — a fixed scale
 * can't do that, which is why the model was previously cut off.
 */
function FitToViewport({ children, margin = 0.78 }) {
  const { viewport } = useThree();
  const scale = (Math.min(viewport.width, viewport.height) / 2 / OBJECT_RADIUS) * margin;
  return <group scale={scale}>{children}</group>;
}

/**
 * Refractive glass torus knot. On a cream background a transmissive material
 * reads far better than an opaque one — it picks up and bends the page colour
 * instead of sitting on top of it as a dark silhouette.
 */
function GlassKnot({ accent }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation.y += delta * 0.18;
    mesh.rotation.z += delta * 0.05;

    // Eased lean toward the pointer — tracking, not snapping.
    const targetX = state.pointer.y * 0.3;
    const targetY = state.pointer.x * 0.4;
    mesh.rotation.x += (targetX - mesh.rotation.x) * 0.045;
    // Small drift only — large offsets pushed the object out of frame.
    mesh.position.x += (state.pointer.x * 0.1 - mesh.position.x) * 0.045;
    mesh.position.y += (state.pointer.y * 0.08 - mesh.position.y) * 0.045;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.14} floatIntensity={0.35}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.34, 220, 40]} />
        <MeshTransmissionMaterial
          samples={6}
          resolution={256}
          thickness={0.65}
          roughness={0.06}
          ior={1.42}
          chromaticAberration={0.28}
          anisotropy={0.2}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.08}
          color="#ffffff"
          attenuationColor={accent}
          attenuationDistance={2.4}
          backside
        />
      </mesh>
    </Float>
  );
}

/** A faint accent-tinted disc behind the glass, so refraction has something to bend. */
function BackPlate({ accent }) {
  return (
    <mesh position={[0, 0, -1.6]}>
      <circleGeometry args={[1.35, 64]} />
      <meshBasicMaterial color={accent} transparent opacity={0.18} />
    </mesh>
  );
}

function Dust() {
  const pointsRef = useRef(null);

  const positions = useMemo(() => {
    const count = 90;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Shell distribution so particles frame the object instead of clipping it.
      const radius = 2.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y -= delta * 0.025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#17181b" transparent opacity={0.28} sizeAttenuation />
    </points>
  );
}

export default function HeroScene({ accent = "#3B82F6" }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} />

      {/* Everything scales together so the composition holds at any canvas shape. */}
      <FitToViewport>
        <BackPlate accent={accent} />
        <GlassKnot accent={accent} />
      </FitToViewport>
      <Dust />

      {/* Studio softboxes give the glass edges something to catch. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[3, 3, 2]} scale={5} />
        <Lightformer form="rect" intensity={2} position={[-3, -1, 2]} scale={4} color={accent} />
        <Lightformer form="ring" intensity={1.6} position={[0, 2, -3]} scale={3} />
      </Environment>
    </Canvas>
  );
}
