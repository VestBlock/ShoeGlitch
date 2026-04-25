'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function SignalAssembly({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const cardRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const ring = ringRef.current;
    const card = cardRef.current;

    if (!group || !ring || !card) return;

    const time = state.clock.elapsedTime;
    const pointerX = reduceMotion ? 0 : state.pointer.x;
    const pointerY = reduceMotion ? 0 : state.pointer.y;

    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -pointerY * 0.22, 0.06);
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      pointerX * 0.34 + (reduceMotion ? 0.08 : 0.14) * Math.sin(time * 0.35),
      0.06,
    );
    group.position.y = reduceMotion ? 0 : Math.sin(time * 0.55) * 0.14;

    ring.rotation.z += delta * (reduceMotion ? 0.1 : 0.22);
    ring.rotation.x = Math.sin(time * 0.4) * 0.3 + 0.9;
    card.rotation.z = Math.sin(time * 0.7) * 0.04 - 0.08;
  });

  return (
    <group ref={groupRef}>
      <Float speed={reduceMotion ? 0.6 : 1.6} rotationIntensity={reduceMotion ? 0.15 : 0.5} floatIntensity={reduceMotion ? 0.25 : 0.85}>
        <mesh ref={ringRef} position={[1.55, 0.85, -0.3]}>
          <torusGeometry args={[1.6, 0.045, 28, 160]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={2.4}
            metalness={0.86}
            roughness={0.12}
          />
        </mesh>
      </Float>

      <Float speed={reduceMotion ? 0.5 : 1.4} rotationIntensity={reduceMotion ? 0.12 : 0.35} floatIntensity={reduceMotion ? 0.18 : 0.6}>
        <RoundedBox
          ref={cardRef}
          args={[3.5, 2.25, 0.14]}
          radius={0.18}
          position={[0.05, 0.28, -0.55]}
          rotation={[0.2, -0.52, -0.06]}
        >
          <meshStandardMaterial
            color="#0b1934"
            emissive="#07142c"
            emissiveIntensity={0.9}
            metalness={0.4}
            roughness={0.18}
          />
        </RoundedBox>
      </Float>

      <Float speed={reduceMotion ? 0.75 : 1.9} rotationIntensity={reduceMotion ? 0.14 : 0.6} floatIntensity={reduceMotion ? 0.2 : 0.95}>
        <mesh position={[-1.55, -0.75, 1.2]}>
          <icosahedronGeometry args={[0.62, 1]} />
          <meshPhysicalMaterial
            color="#ff4d6d"
            emissive="#ff4d6d"
            emissiveIntensity={1.35}
            metalness={0.22}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.12}
          />
        </mesh>
      </Float>

      <Float speed={reduceMotion ? 0.45 : 1.15} rotationIntensity={reduceMotion ? 0.08 : 0.18} floatIntensity={reduceMotion ? 0.15 : 0.45}>
        <mesh position={[1.05, -1.18, 0.65]} rotation={[0.45, -0.4, 0.9]}>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#5ab3ff"
            emissiveIntensity={0.8}
            metalness={0.92}
            roughness={0.14}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroSignalScene({ reduceMotion = false }: { reduceMotion?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-scene-noise absolute inset-0" />
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 7.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#07142c']} />
          <fog attach="fog" args={['#07142c', 6.8, 15]} />
          <ambientLight intensity={1.05} />
          <directionalLight position={[2.4, 2.6, 5]} intensity={2.6} color="#ffffff" />
          <pointLight position={[3, 2.2, 4]} intensity={24} color="#00e5ff" />
          <pointLight position={[-3.2, -1.4, 3.8]} intensity={18} color="#ff4d6d" />
          <spotLight position={[0, 3.5, 5.5]} angle={0.42} penumbra={0.8} intensity={14} color="#5ab3ff" />

          <SignalAssembly reduceMotion={reduceMotion} />
          <Sparkles
            count={reduceMotion ? 18 : 36}
            scale={[8, 5, 8]}
            size={reduceMotion ? 2.2 : 3.1}
            speed={reduceMotion ? 0.18 : 0.55}
            opacity={0.85}
            color="#f7fbff"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
