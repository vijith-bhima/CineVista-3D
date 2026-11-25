'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useBookingStore } from '@/store/useBookingStore';

interface CinemaRoomProps {
  isMobile?: boolean;
}

export default function CinemaRoom({ isMobile = false }: CinemaRoomProps) {
  const houseLights = useBookingStore((s) => s.houseLights);

  // 13 tiered seat risers for Rows A to M
  const risers = useMemo(() => {
    const items = [];
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    for (let i = 0; i < 13; i++) {
      const z = -7.5 + i * 2.05;
      const y = i * 0.45;
      items.push({
        letter: rowLetters[i],
        z,
        y,
        height: y + 0.45,
        depth: 2.35,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {/* 1. Large Cinema Enclosure */}
      <mesh position={[0, 11, 3]}>
        <boxGeometry args={[34, 26, 48]} />
        <meshStandardMaterial
          color="#060504"
          roughness={0.96}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Solid Foundation Slab */}
      <mesh position={[0, -0.65, 3]}>
        <boxGeometry args={[33, 1.2, 47]} />
        <meshStandardMaterial color="#0b0907" roughness={0.95} />
      </mesh>

      {/* Main Floor Base (Dark acoustic carpet) */}
      <mesh position={[0, -0.06, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 46]} />
        <meshStandardMaterial color="#100e0b" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. ATMOSPHERIC MOODY DARK RED CARPET FLOOR between screen and seats (Low brightness) */}
      <mesh position={[0, 0.01, -12.8]}>
        <boxGeometry args={[27.0, 0.04, 10.2]} />
        <meshStandardMaterial
          color="#380910" // Dark, rich, moody burgundy velvet
          roughness={0.92}
          metalness={0.0}
          emissive="#000000" // Zero emissive glare
        />
      </mesh>

      {/* Glowing Golden LED Stage Apron Border Line */}
      <mesh position={[0, 0.04, -7.8]}>
        <boxGeometry args={[26.0, 0.02, 0.1]} />
        <meshBasicMaterial color="#f5c518" />
      </mesh>

      {/* Stepped Tiered Risers for 13 Rows (A to M) */}
      {risers.map((r, idx) => {
        const stepTopY = r.y + 0.21; // Exact top walking surface of this step

        return (
          <group key={`riser-${idx}`}>
            {/* Left Seating Tier */}
            <mesh position={[-4.5, r.y / 2, r.z - 0.20]}>
              <boxGeometry args={[6.2, r.height, r.depth]} />
              <meshStandardMaterial color="#100e0b" roughness={0.92} />
            </mesh>
            <mesh position={[-9.6, r.y / 2, r.z - 0.90]} rotation={[0, 0.14, 0]}>
              <boxGeometry args={[5.6, r.height, r.depth]} />
              <meshStandardMaterial color="#100e0b" roughness={0.92} />
            </mesh>

            {/* Right Seating Tier */}
            <mesh position={[4.5, r.y / 2, r.z - 0.20]}>
              <boxGeometry args={[6.2, r.height, r.depth]} />
              <meshStandardMaterial color="#100e0b" roughness={0.92} />
            </mesh>
            <mesh position={[9.6, r.y / 2, r.z - 0.90]} rotation={[0, -0.14, 0]}>
              <boxGeometry args={[5.6, r.height, r.depth]} />
              <meshStandardMaterial color="#100e0b" roughness={0.92} />
            </mesh>

            {/* Center Walkway Step with Red Carpet Runner */}
            <mesh position={[0, (r.y / 2) - 0.03, r.z]}>
              <boxGeometry args={[2.7, r.height + 0.02, r.depth]} />
              <meshStandardMaterial color="#5a0b16" roughness={0.85} />
            </mesh>

            {/* Glowing Golden LED Floor Line running down the aisle */}
            <mesh position={[-1.38, stepTopY + 0.01, r.z]}>
              <boxGeometry args={[0.06, 0.02, r.depth]} />
              <meshBasicMaterial color="#f5c518" />
            </mesh>
            <mesh position={[1.38, stepTopY + 0.01, r.z]}>
              <boxGeometry args={[0.06, 0.02, r.depth]} />
              <meshBasicMaterial color="#f5c518" />
            </mesh>

            {/* REAL CINEMA STEP AISLE LIGHTS ON THE FLOOR BETWEEN THE TWO HALF BLOCKS OF SEATS */}
            {/* 1. Left Aisle Floor LED Pucks */}
            {[-0.6, 0.0, 0.6].map((offsetZ, pIdx) => (
              <group key={`step-light-left-${idx}-${pIdx}`} position={[-1.15, stepTopY + 0.015, r.z + offsetZ]}>
                {/* Dark Outer Bezel */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.035, 0.06, 12]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
                {/* Glowing Amber Light Lens */}
                <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.035, 12]} />
                  <meshBasicMaterial color="#fde047" />
                </mesh>
              </group>
            ))}

            {/* 2. Right Aisle Floor LED Pucks */}
            {[-0.6, 0.0, 0.6].map((offsetZ, pIdx) => (
              <group key={`step-light-right-${idx}-${pIdx}`} position={[1.15, stepTopY + 0.015, r.z + offsetZ]}>
                {/* Dark Outer Bezel */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.035, 0.06, 12]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
                {/* Glowing Amber Light Lens */}
                <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.035, 12]} />
                  <meshBasicMaterial color="#fde047" />
                </mesh>
              </group>
            ))}

            {/* 3. Front Riser Face Step Marker Lights (Facing the audience) */}
            {[-0.8, 0.8].map((posX, fIdx) => (
              <group key={`riser-face-light-${idx}-${fIdx}`} position={[posX, stepTopY - 0.12, r.z - (r.depth / 2) + 0.02]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
                  <meshBasicMaterial color="#fde047" />
                </mesh>
              </group>
            ))}

            {/* Floating Row Letter on Step Risers */}
            <group position={[-1.48, r.y + 0.26, r.z]} rotation={[0, Math.PI / 2, 0]}>
              <Text
                fontSize={0.24}
                color="#fde047"
                anchorX="center"
                anchorY="middle"
              >
                {r.letter}
              </Text>
            </group>

            <group position={[1.48, r.y + 0.26, r.z]} rotation={[0, -Math.PI / 2, 0]}>
              <Text
                fontSize={0.24}
                color="#fde047"
                anchorX="center"
                anchorY="middle"
              >
                {r.letter}
              </Text>
            </group>
          </group>
        );
      })}

      {/* 3. Side Walls: WARM DARK BROWN WOOD ACOUSTIC PANELS & Architectural Trims */}
      {[-13.8, 13.8].map((xWall, sideIdx) => (
        <group key={`wood-wall-${sideIdx}`}>
          {/* Main Warm Brown Wood Wall Plane */}
          <mesh position={[xWall, 9.0, 3]}>
            <boxGeometry args={[0.04, 18, 44]} />
            <meshStandardMaterial
              color="#2a1f18"
              roughness={0.88}
              metalness={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Horizontal Architectural Gold Trim Rails */}
          <mesh position={[sideIdx === 0 ? xWall + 0.03 : xWall - 0.03, 4.2, 3]}>
            <boxGeometry args={[0.04, 0.06, 44.0]} />
            <meshBasicMaterial color="#f5c518" />
          </mesh>
          <mesh position={[sideIdx === 0 ? xWall + 0.03 : xWall - 0.03, 12.0, 3]}>
            <boxGeometry args={[0.04, 0.06, 44.0]} />
            <meshBasicMaterial color="#f5c518" />
          </mesh>

          {/* Warm Wood Vertical Accent Columns */}
          {[-15, -9, -3, 3, 9, 15, 21].map((zCol, cIdx) => (
            <mesh
              key={`wood-col-${cIdx}`}
              position={[sideIdx === 0 ? xWall + 0.05 : xWall - 0.05, 9.0, zCol]}
            >
              <boxGeometry args={[0.07, 18.0, 0.25]} />
              <meshStandardMaterial color="#3d2c22" roughness={0.85} />
            </mesh>
          ))}

          {/* Vertical Warm Architectural Sconce Lights */}
          {[-12, -6, 0, 6, 12, 18].map((zSconce, sIdx) => (
            <group
              key={`vert-sconce-${sIdx}`}
              position={[sideIdx === 0 ? xWall + 0.10 : xWall - 0.10, 8.2, zSconce]}
            >
              <mesh>
                <boxGeometry args={[0.05, 1.8, 0.35]} />
                <meshStandardMaterial color="#0d0b0a" roughness={0.7} metalness={0.3} />
              </mesh>
              <mesh position={[sideIdx === 0 ? 0.03 : -0.03, 0, 0]}>
                <boxGeometry args={[0.03, 1.6, 0.22]} />
                <meshBasicMaterial color={houseLights ? '#fffbeb' : '#f59e0b'} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Rear Wall Warm Wood Panel */}
      <mesh position={[0, 9.5, 20.8]}>
        <boxGeometry args={[27.0, 18, 0.04]} />
        <meshStandardMaterial color="#221811" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* Prominent Green Glowing Emergency EXIT Signs on Left & Right Walls near Front */}
      {[-13.7, 13.7].map((xPos, sideIdx) => (
        <group key={`exit-sign-${sideIdx}`} position={[xPos, 5.8, -13.5]}>
          <mesh>
            <boxGeometry args={[0.08, 0.65, 1.45]} />
            <meshStandardMaterial color="#042f1a" emissive="#10b981" emissiveIntensity={1.3} />
          </mesh>
          <group
            position={[sideIdx === 0 ? 0.06 : -0.06, 0, 0]}
            rotation={[0, sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <Text
              fontSize={0.28}
              color="#34d399"
              anchorX="center"
              anchorY="middle"
            >
              EXIT
            </Text>
          </group>
        </group>
      ))}

      {/* 4. CLEAN DARK ACOUSTIC CEILING (Removed all yellow cove/panels completely!) */}
      <mesh position={[0, 14.85, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28.0, 42.0]} />
        <meshStandardMaterial color="#0a0907" roughness={0.98} />
      </mesh>

      {/* Subtle Recessed Warm Off-White Downlights (No glaring yellow!) */}
      {[-9, -4.5, 0, 4.5, 9].map((xPos) =>
        [-12, -6, 0, 6, 12, 18].map((zPos) => (
          <group key={`downlight-${xPos}-${zPos}`} position={[xPos, 14.78, zPos]}>
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.26, 20]} />
              <meshBasicMaterial color={houseLights ? '#fffbeb' : '#fef3c7'} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))
      )}

      {/* Cinematic Warm Ambient Light & Directional Definition Light */}
      <ambientLight intensity={houseLights ? 0.95 : 0.55} color={houseLights ? '#fef3c7' : '#e2e8f0'} />
      <directionalLight position={[0, 18, 8]} intensity={0.75} color="#fef3c7" />

      {/* Screen / Stage Front Projector Fill Light - brightly illuminates seats when viewed from screen */}
      <directionalLight position={[0, 8.5, -16.0]} intensity={0.65} color="#fed7aa" />

      {/* 2 Gentle Low-Cost Aisle Floor Fill Lights illuminating the steps without lag */}
      <pointLight position={[0, 3.2, -2]} intensity={0.4} distance={9} color="#f59e0b" />
      <pointLight position={[0, 5.8, 8]} intensity={0.4} distance={10} color="#f59e0b" />

      {/* Warm Sconce Lights casting onto brown wood panels */}
      <pointLight position={[-13.5, 8.5, -4]} intensity={houseLights ? 1.4 : 0.9} distance={16} color="#f59e0b" />
      <pointLight position={[13.5, 8.5, -4]} intensity={houseLights ? 1.4 : 1.0} distance={16} color="#f59e0b" />
      <pointLight position={[-13.5, 9.0, 8]} intensity={houseLights ? 1.4 : 1.0} distance={16} color="#f59e0b" />
      <pointLight position={[13.5, 9.0, 8]} intensity={houseLights ? 1.4 : 1.0} distance={16} color="#f59e0b" />

      {houseLights && (
        <>
          <pointLight position={[0, 19, 2]} intensity={1.4} distance={35} color="#fffbeb" />
          <pointLight position={[0, 19, 12]} intensity={1.4} distance={35} color="#fffbeb" />
        </>
      )}
    </group>
  );
}
