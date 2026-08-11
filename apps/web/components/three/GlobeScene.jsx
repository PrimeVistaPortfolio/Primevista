"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { landPointsOnSphere, latLonToVec3 } from "./worldLand";

const GLOBE_RADIUS = 1;
// Globe plus atmosphere plus the tallest arc — what has to fit in frame.
const OBJECT_RADIUS = 1.32;

// Freight lanes. Each pair is drawn as a great-circle arc with a pulse
// travelling along it; `delay` staggers them so they never fire in unison.
const LANES = [
  { from: [40.7, -74.0], to: [51.5, -0.13], delay: 0.0 },   // New York → London
  { from: [51.5, -0.13], to: [25.2, 55.3], delay: 0.35 },   // London → Dubai
  { from: [25.2, 55.3], to: [1.35, 103.8], delay: 0.7 },    // Dubai → Singapore
  { from: [1.35, 103.8], to: [31.2, 121.5], delay: 0.15 },  // Singapore → Shanghai
  { from: [31.2, 121.5], to: [34.0, -118.2], delay: 0.5 },  // Shanghai → Los Angeles
  { from: [34.0, -118.2], to: [-23.5, -46.6], delay: 0.85 }, // Los Angeles → São Paulo
  { from: [-33.9, 18.4], to: [19.1, 72.9], delay: 0.25 },   // Cape Town → Mumbai
  { from: [-33.9, 151.2], to: [1.35, 103.8], delay: 0.6 },  // Sydney → Singapore
];

const HUBS = Array.from(
  new Map(LANES.flatMap((l) => [l.from, l.to]).map((c) => [c.join(), c])).values(),
);

/**
 * Per-theme treatment.
 *
 * A canvas can't inherit the page's colour tokens, so the ground it sits on has
 * to be passed in. It isn't only a colour swap: the halo is additive on a dark
 * ground, where light accumulating over darkness reads as glow, but additive
 * light on a pale ground just races to white and disappears — so the light
 * theme tints with normal blending instead. Ink-on-cream also carries more
 * contrast than ink-on-black, so every opacity comes down to compensate.
 */
const PALETTES = {
  dark: {
    // Matches --color-ink for each theme: light dots on a dark ground, dark
    // dots on a pale one.
    dotColor: "#dbdcdc",
    dotOpacity: 1,
    haloBlending: THREE.AdditiveBlending,
    haloStrength: 0.85,
    haloPower: 3,
    arcOpacity: 0.32,
    moteOpacity: 0.50,
    ringOpacity: 0.6,
  },
  light: {
    dotColor: "#000000",
    dotOpacity: 1,
    haloBlending: THREE.NormalBlending,
    haloStrength: 0.4,
    haloPower: 2.2,
    arcOpacity: 0.5,
    moteOpacity: 0.22,
    ringOpacity: 0.75,
  },
};

const paletteFor = (theme) => PALETTES[theme] || PALETTES.dark;

/** Scales its children so the globe fills the canvas at any aspect ratio. */
function FitToViewport({ children, margin = 0.86 }) {
  const { viewport } = useThree();
  const scale = (Math.min(viewport.width, viewport.height) / 2 / OBJECT_RADIUS) * margin;
  return <group scale={scale}>{children}</group>;
}

/** A soft round sprite, so the land dots read as dots rather than pixels. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.55, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/** The continents, drawn as a dot matrix on the sphere's surface. */
function LandDots({ color, opacity }) {
  const positions = useMemo(() => landPointsOnSphere(17000, GLOBE_RADIUS), []);
  const texture = useDotTexture();

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        alphaTest={0.05}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Depth-only sphere just under the dots.
 *
 * It paints no colour, so it works on any page background, but it does write
 * depth — which is what stops the far side's dots from bleeding through the
 * near side and turning the globe into a fuzzy ball.
 */
function Occluder() {
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[GLOBE_RADIUS * 0.985, 48, 48]} />
      <meshBasicMaterial colorWrite={false} />
    </mesh>
  );
}

/** Fresnel rim light — the accent-tinted halo hugging the silhouette. */
function Atmosphere({ accent, palette }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(accent) },
          uStrength: { value: palette.haloStrength },
          uPower: { value: palette.haloPower },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uStrength;
          uniform float uPower;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vView));
            gl_FragColor = vec4(uColor, pow(rim, uPower) * uStrength);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: palette.haloBlending,
        depthWrite: false,
      }),
    [accent, palette],
  );

  return (
    <mesh material={material} renderOrder={-2}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.16, 48, 48]} />
    </mesh>
  );
}

/** Great-circle path between two coordinates, bowed out above the surface. */
function laneCurve(from, to) {
  const a = new THREE.Vector3(...latLonToVec3(from[0], from[1], GLOBE_RADIUS));
  const b = new THREE.Vector3(...latLonToVec3(to[0], to[1], GLOBE_RADIUS));
  // Longer hops arc higher, the way a flight path map reads.
  const lift = 0.12 + a.angleTo(b) * 0.13;

  const points = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = a.clone().lerp(b, t).normalize();
    point.multiplyScalar(GLOBE_RADIUS + Math.sin(Math.PI * t) * lift);
    points.push(point);
  }
  return new THREE.CatmullRomCurve3(points);
}

/** One lane: a faint tube plus a pulse running along it on a loop. */
function Lane({ from, to, delay, accent, opacity, speed = 0.22 }) {
  const curve = useMemo(() => laneCurve(from, to), [from, to]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.0035, 6, false), [curve]);
  const pulseRef = useRef(null);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const pulse = pulseRef.current;
    if (!pulse) return;

    const t = (state.clock.elapsedTime * speed + delay) % 1;
    curve.getPointAt(t, scratch);
    pulse.position.copy(scratch);
    // Fade in and out at the ends so the pulse doesn't pop at the seam.
    const fade = Math.sin(Math.PI * t);
    pulse.scale.setScalar(0.4 + fade * 0.9);
    pulse.material.opacity = fade;
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={accent} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A hub city: a dot on the surface with a ring breathing out of it. */
function Hub({ lat, lon, accent, phase, ringOpacity }) {
  const position = useMemo(() => latLonToVec3(lat, lon, GLOBE_RADIUS * 1.005), [lat, lon]);
  const ringRef = useRef(null);

  // The ring lies flat on the surface, so orient it along the local normal.
  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(...position).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [position]);

  useFrame((state) => {
    const ring = ringRef.current;
    if (!ring) return;

    const t = (state.clock.elapsedTime * 0.5 + phase) % 1;
    ring.scale.setScalar(0.5 + t * 2.2);
    ring.material.opacity = (1 - t) * ringOpacity;
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.022, 0.03, 32]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Everything that spins: the globe body, its lanes, and its hubs. */
function Globe({ accent, dotColor, palette }) {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y += delta * 0.09;
    // Eased lean toward the pointer — tracking, not snapping.
    const targetX = -state.pointer.y * 0.28;
    group.rotation.x += (targetX - group.rotation.x) * 0.04;
  });

  return (
    // Axial tilt, applied outside the spin so the globe leans as it turns.
    <group rotation={[0, 0, 0.41]}>
      <Atmosphere accent={accent} palette={palette} />
      <group ref={groupRef}>
        <Occluder />
        <LandDots color={dotColor} opacity={palette.dotOpacity} />
        {HUBS.map(([lat, lon], i) => (
          <Hub
            key={`${lat}:${lon}`}
            lat={lat}
            lon={lon}
            accent={accent}
            phase={i * 0.13}
            ringOpacity={palette.ringOpacity}
          />
        ))}
        {LANES.map((lane, i) => (
          <Lane key={i} {...lane} accent={accent} opacity={palette.arcOpacity} />
        ))}
      </group>
    </group>
  );
}

/** Sparse motes around the globe, for a little depth behind the silhouette. */
function Motes({ color, opacity }) {
  const ref = useRef(null);

  const positions = useMemo(() => {
    const count = 110;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 1.7 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color={color} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
}

export default function GlobeScene({ accent = "#3B82F6", dotColor, theme = "dark" }) {
  const palette = paletteFor(theme);
  // The theme owns the dot colour; the prop is an escape hatch, not the norm.
  const dots = dotColor || palette.dotColor;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={1} />
      <FitToViewport>
        <Globe accent={accent} dotColor={dots} palette={palette} />
      </FitToViewport>
      <Motes color={dots} opacity={palette.moteOpacity} />
    </Canvas>
  );
}
