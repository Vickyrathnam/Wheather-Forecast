'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Cloud, Float, Sphere, Ring, Trail, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useWeatherStore, WeatherMode } from '@/store/weatherStore';

// ============================================
// SUNNY MODE
// ============================================
function SunnyScene() {
  const sunRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sunRef.current) {
      sunRef.current.rotation.z = t * 0.1;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.2;
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.02;
      particlesRef.current.position.y = Math.sin(t * 0.3) * 0.5;
    }
  });

  return (
    <group>
      {/* Sun core */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere ref={sunRef} args={[3.5, 64, 64]} position={[0, 1, -10]}>
          <MeshDistortMaterial
            color="#ff9500"
            emissive="#ff6000"
            emissiveIntensity={2}
            distort={0.3}
            speed={2}
            roughness={0}
          />
        </Sphere>
        {/* Sun glow layers */}
        <Sphere args={[4.5, 32, 32]} position={[0, 1, -10]}>
          <meshBasicMaterial color="#ff6000" transparent opacity={0.1} side={THREE.BackSide} />
        </Sphere>
        <Sphere args={[6, 32, 32]} position={[0, 1, -10]}>
          <meshBasicMaterial color="#ff9500" transparent opacity={0.05} side={THREE.BackSide} />
        </Sphere>
        {/* Energy rings */}
        <Ring ref={ring1Ref} args={[4.8, 5.2, 64]} position={[0, 1, -10]} rotation={[Math.PI / 4, 0, 0]}>
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.4} side={THREE.DoubleSide} />
        </Ring>
        <Ring ref={ring2Ref} args={[5.5, 5.9, 64]} position={[0, 1, -10]} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <meshBasicMaterial color="#ff9500" transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>
      </Float>

      {/* Clouds */}
      {[[-8, 3, -5], [6, 2, -4], [-4, 5, -8], [10, 4, -6]].map((pos, i) => (
        <Float key={i} speed={0.5 + i * 0.2} floatIntensity={0.3}>
          <Cloud
            position={pos as [number, number, number]}
            opacity={0.6 - i * 0.1}
            speed={0.2}
            color="#ffe4b5"
          />
        </Float>
      ))}

      {/* God rays light */}
      <directionalLight position={[0, 1, -8]} intensity={3} color="#ff9500" />
      <pointLight position={[0, 1, -8]} intensity={5} color="#ffcc00" distance={30} />
      <ambientLight intensity={0.5} color="#ff6000" />

      {/* Golden particles */}
      <points ref={particlesRef} geometry={particles}>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.7} />
      </points>
    </group>
  );
}

// ============================================
// RAIN MODE
// ============================================
function RainScene() {
  const rainRef = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);

  const rainGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities[i] = 0.2 + Math.random() * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    return geo;
  }, []);

  const mistGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!rainRef.current) return;
    const positions = rainRef.current.geometry.attributes.position;
    const velocities = rainRef.current.geometry.attributes.velocity;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, positions.getY(i) - velocities.getX(i));
      positions.setX(i, positions.getX(i) - velocities.getX(i) * 0.1); // wind
      if (positions.getY(i) < -8) {
        positions.setY(i, 30);
        positions.setX(i, (Math.random() - 0.5) * 50);
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <group>
      {/* Rain streaks */}
      <points ref={rainRef} geometry={rainGeometry}>
        <pointsMaterial size={0.05} color="#7eb8f7" transparent opacity={0.6} />
      </points>
      {/* Mist */}
      <points ref={mistRef} geometry={mistGeometry}>
        <pointsMaterial size={0.5} color="#aac4ff" transparent opacity={0.15} />
      </points>
      {/* Dark clouds */}
      {[[-5, 8, -8], [4, 7, -6], [-2, 10, -10], [8, 6, -5]].map((pos, i) => (
        <Float key={i} speed={0.3} floatIntensity={0.2}>
          <Cloud
            position={pos as [number, number, number]}
            color={`hsl(220, 30%, ${15 + i * 5}%)`}
            opacity={0.9}
            speed={0.1}
          />
        </Float>
      ))}
      {/* Moody lighting */}
      <ambientLight intensity={0.3} color="#1a3a6e" />
      <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#4a7ab5" />
      <pointLight position={[0, -5, 0]} intensity={2} color="#0040aa" distance={20} />
    </group>
  );
}

// ============================================
// THUNDERSTORM MODE
// ============================================
function ThunderstormScene() {
  const lightningRef = useRef<THREE.Mesh>(null);
  const rainRef = useRef<THREE.Points>(null);
  const flashRef = useRef<THREE.PointLight>(null);
  const lastFlash = useRef(0);

  const rainGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 50 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Heavy rain
    if (rainRef.current) {
      const pos = rainRef.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, pos.getY(i) - 0.5);
        pos.setX(i, pos.getX(i) - 0.08);
        if (pos.getY(i) < -8) {
          pos.setY(i, 40);
          pos.setX(i, (Math.random() - 0.5) * 60);
        }
      }
      pos.needsUpdate = true;
    }

    // Lightning flash
    if (flashRef.current) {
      const timeSinceLast = t - lastFlash.current;
      if (timeSinceLast > 2 + Math.random() * 4) {
        lastFlash.current = t;
        flashRef.current.intensity = 100;
        setTimeout(() => { if (flashRef.current) flashRef.current.intensity = 0; }, 100);
        setTimeout(() => { if (flashRef.current) flashRef.current.intensity = 60; }, 150);
        setTimeout(() => { if (flashRef.current) flashRef.current.intensity = 0; }, 250);
      }
    }
  });

  return (
    <group>
      <points ref={rainRef} geometry={rainGeometry}>
        <pointsMaterial size={0.04} color="#aad4ff" transparent opacity={0.7} />
      </points>

      {/* Storm clouds */}
      {[[-8, 9, -12], [5, 8, -10], [0, 11, -14], [-3, 7, -8], [9, 10, -12]].map((pos, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.1}>
          <Cloud
            position={pos as [number, number, number]}
            color={`hsl(260, 40%, ${8 + i * 3}%)`}
            opacity={0.95}
          />
        </Float>
      ))}

      {/* Lightning bolt - simplified line */}
      <mesh position={[2, 5, -5]}>
        <cylinderGeometry args={[0.03, 0.01, 10, 4]} />
        <meshBasicMaterial color="#9966ff" transparent opacity={0} />
      </mesh>

      {/* Electric particles */}
      <pointLight ref={flashRef} position={[2, 8, -5]} intensity={0} color="#a78bfa" distance={50} />

      <ambientLight intensity={0.15} color="#1a0040" />
      <directionalLight position={[0, 5, -10]} intensity={0.5} color="#3a1a6e" />
    </group>
  );
}

// ============================================
// SNOW MODE
// ============================================
function SnowScene() {
  const snowRef = useRef<THREE.Points>(null);

  const snowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      sizes[i] = 0.1 + Math.random() * 0.15;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!snowRef.current) return;
    const pos = snowRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) - 0.03);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.5 + i) * 0.005);
      if (pos.getY(i) < -8) {
        pos.setY(i, 30);
        pos.setX(i, (Math.random() - 0.5) * 50);
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      <points ref={snowRef} geometry={snowGeometry}>
        <pointsMaterial size={0.12} color="#e0f2fe" transparent opacity={0.9} sizeAttenuation />
      </points>
      {[[-6, 5, -6], [5, 7, -8], [0, 8, -10], [-3, 6, -4]].map((pos, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.1}>
          <Cloud
            position={pos as [number, number, number]}
            color="#dce8ff"
            opacity={0.5}
          />
        </Float>
      ))}
      <ambientLight intensity={0.6} color="#b0d4ff" />
      <directionalLight position={[0, 5, 0]} intensity={1} color="#e0f2fe" />
    </group>
  );
}

// ============================================
// NIGHT / SPACE MODE
// ============================================
function NightScene() {
  const auroraRef = useRef<THREE.Mesh>(null);
  const meteorRef = useRef<THREE.Mesh>(null);
  const meteorPos = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (auroraRef.current) {
      (auroraRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 0.5) * 0.05;
    }
    if (meteorRef.current) {
      meteorPos.current += 0.3;
      meteorRef.current.position.x = -20 + meteorPos.current;
      meteorRef.current.position.y = 8 - meteorPos.current * 0.3;
      if (meteorPos.current > 45) meteorPos.current = 0;
    }
  });

  return (
    <group>
      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />
      
      {/* Aurora */}
      <mesh ref={auroraRef} position={[0, 5, -20]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[80, 15]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 3, -18]} rotation={[0.05, 0, 0]}>
        <planeGeometry args={[70, 10]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Moon */}
      <Float speed={0.3} floatIntensity={0.2}>
        <Sphere args={[2, 32, 32]} position={[8, 5, -15]}>
          <meshStandardMaterial color="#d4e8ff" emissive="#7090c0" emissiveIntensity={0.3} roughness={0.8} />
        </Sphere>
        {/* Moon glow */}
        <Sphere args={[2.8, 32, 32]} position={[8, 5, -15]}>
          <meshBasicMaterial color="#7090c0" transparent opacity={0.05} side={THREE.BackSide} />
        </Sphere>
      </Float>

      {/* Meteor */}
      <mesh ref={meteorRef} position={[-20, 8, -10]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.02, 0.005, 2, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      <ambientLight intensity={0.15} color="#0a0020" />
      <pointLight position={[8, 5, -12]} intensity={1} color="#7090c0" distance={30} />
    </group>
  );
}

// ============================================
// CLOUDS MODE
// ============================================
function CloudyScene() {
  return (
    <group>
      {[[-6, 3, -6], [5, 5, -8], [0, 7, -10], [-3, 4, -5], [8, 3, -7], [-8, 6, -9]].map((pos, i) => (
        <Float key={i} speed={0.3 + i * 0.1} floatIntensity={0.2}>
          <Cloud
            position={pos as [number, number, number]}
            color={`hsl(220, 20%, ${30 + i * 5}%)`}
            opacity={0.7}
            speed={0.2}
          />
        </Float>
      ))}
      <ambientLight intensity={0.4} color="#8090aa" />
      <directionalLight position={[0, 5, 0]} intensity={0.8} color="#a0b0c0" />
    </group>
  );
}

// ============================================
// MOUSE PARALLAX CAMERA
// ============================================
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 1 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -5);
  });

  return null;
}

// ============================================
// MAIN WEATHER ENGINE
// ============================================
const sceneMap: Record<WeatherMode, React.ComponentType> = {
  sunny: SunnyScene,
  rain: RainScene,
  storm: ThunderstormScene,
  snow: SnowScene,
  night: NightScene,
  clouds: CloudyScene,
};

const bgMap: Record<WeatherMode, string> = {
  sunny: 'linear-gradient(180deg, #1a0a00 0%, #2d1500 40%, #0f1a2e 100%)',
  rain: 'linear-gradient(180deg, #050a1a 0%, #0a1428 40%, #111a2e 100%)',
  storm: 'linear-gradient(180deg, #05001a 0%, #0d0025 40%, #1a0030 100%)',
  snow: 'linear-gradient(180deg, #060d20 0%, #0d1830 40%, #08102a 100%)',
  night: 'linear-gradient(180deg, #000005 0%, #03001a 40%, #060018 100%)',
  clouds: 'linear-gradient(180deg, #080d1a 0%, #0d1424 40%, #101828 100%)',
};

export default function WeatherEngine() {
  const weatherMode = useWeatherStore(s => s.weatherMode);
  const SceneComponent = sceneMap[weatherMode];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: bgMap[weatherMode],
      transition: 'background 2s ease',
    }}>
      {/* Atmospheric vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Weather mode indicator */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.8rem',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: weatherMode === 'sunny' ? '#f59e0b' :
            weatherMode === 'rain' ? '#3b82f6' :
            weatherMode === 'storm' ? '#7c3aed' :
            weatherMode === 'snow' ? '#e0f2fe' :
            weatherMode === 'night' ? '#a855f7' : '#64748b',
          boxShadow: `0 0 8px currentColor`,
        }} />
        <span style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          fontFamily: 'Space Grotesk, monospace',
          textTransform: 'uppercase',
        }}>
          {weatherMode} MODE
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 500 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <SceneComponent />
        </Suspense>
      </Canvas>
    </div>
  );
}
