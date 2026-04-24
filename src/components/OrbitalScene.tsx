'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OrbitalScene({
  className = '',
  accent = '#ff4d6d',
  glow = '#00e5ff',
}: {
  className?: string;
  accent?: string;
  glow?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(0, 0.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    const point = new THREE.PointLight(glow, 7, 20);
    point.position.set(2.4, 2.2, 3.5);
    const pointTwo = new THREE.PointLight(accent, 5, 20);
    pointTwo.position.set(-2.5, -1.8, 2.4);
    scene.add(ambient, point, pointTwo);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 1),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0f1e42'),
        emissive: new THREE.Color(accent),
        emissiveIntensity: 0.28,
        roughness: 0.28,
        metalness: 0.72,
        clearcoat: 0.7,
      }),
    );
    group.add(core);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glow),
      transparent: true,
      opacity: 0.9,
    });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.04, 16, 120), ringMaterial);
    ringOne.rotation.x = Math.PI / 2.5;
    const ringTwo = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.03, 16, 120),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.65 }),
    );
    ringTwo.rotation.x = Math.PI / 3.2;
    ringTwo.rotation.y = Math.PI / 5.2;
    group.add(ringOne, ringTwo);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 160;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 2.8 + Math.random() * 1.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: new THREE.Color('#f8fafc'),
        size: 0.038,
        transparent: true,
        opacity: 0.85,
      }),
    );
    scene.add(stars);

    const clock = new THREE.Clock();
    let frameId = 0;

    const render = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = elapsed * 0.34;
      group.rotation.x = Math.sin(elapsed * 0.55) * 0.16;
      core.rotation.x = elapsed * 0.55;
      core.rotation.z = elapsed * 0.38;
      ringOne.rotation.z = elapsed * 0.4;
      ringTwo.rotation.z = -elapsed * 0.26;
      stars.rotation.y = elapsed * 0.06;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      starGeometry.dispose();
      renderer.dispose();
    };
  }, [accent, glow]);

  return (
    <div className={`relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-[radial-gradient(circle_at_50%_30%,rgba(18,31,68,0.82),rgba(7,14,32,0.98))] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.16),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(255,77,109,0.16),transparent_34%)]" />
      <div ref={mountRef} className="relative h-full w-full" />
    </div>
  );
}

