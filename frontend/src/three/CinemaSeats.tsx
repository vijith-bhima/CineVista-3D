'use client';

import React, { useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Seat } from '@/types';
import { useBookingStore } from '@/store/useBookingStore';

interface CinemaSeatsProps {
  seats: Seat[];
  onSeatClick?: (seatLabel: string, price: number) => void;
}

export function getSeatCoordinates(label: string): [number, number, number, number] {
  const rowChar = label.charAt(0).toUpperCase();
  const seatNum = parseInt(label.substring(1), 10);
  const rIdx = Math.max(0, Math.min(12, rowChar.charCodeAt(0) - 65)); // 'A' -> 0 ... 'M' -> 12

  // 26 seats per row: Left block (1-13) and Right block (14-26) with central aisle
  let x = 0;
  if (seatNum <= 13) {
    x = -1.45 - (13 - seatNum) * 0.88;
  } else {
    x = 1.45 + (seatNum - 14) * 0.88;
  }

  const zBase = -7.5 + rIdx * 2.05;
  // Natural cinema amphitheater arc: outer seats curve forward toward the big screen
  const z = zBase - (x * x) / 68.0;
  const y = rIdx * 0.45;

  // Seat rotation around Y: angles inward to face directly towards the screen center
  const rotY = -Math.atan2(x, 34.0);

  return [x, y, z, rotY];
}

interface SeatItemProps {
  label: string;
  row: string;
  seatNum: number;
  rIdx: number;
  category: string;
  price: number;
  isSold: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isMySeat: boolean;
  coords: [number, number, number, number];
  geoms: any;
  mats: any;
  patronMats: any;
  onToggle: (label: string, price: number) => void;
  onHover: (info: any) => void;
  onUnhover: () => void;
}

const SeatItem = React.memo(function SeatItem({
  label,
  row,
  seatNum,
  rIdx,
  category,
  price,
  isSold,
  isSelected,
  isHovered,
  isMySeat,
  coords,
  geoms,
  mats,
  patronMats,
  onToggle,
  onHover,
  onUnhover,
}: SeatItemProps) {
  const [x, y, z, rotY] = coords;
  const isReclinerRow = row === 'L' || row === 'M';

  // Determine upholstery material
  const seatMat = isSelected
    ? mats.selected
    : isHovered
    ? mats.hovered
    : isSold
    ? mats.sold
    : mats.available;

  const clothesIdx = (seatNum + rIdx * 3) % patronMats.clothes.length;
  const skinIdx = (seatNum * 3 + rIdx) % patronMats.skin.length;
  const hairIdx = (seatNum * 5 + rIdx) % patronMats.hair.length;

  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* 1. Fast Invisible Hit Target Mesh (Eliminates raycasting lag across 4,000 child nodes) */}
      <mesh
        geometry={geoms.hitBox}
        material={mats.hitBox}
        position={[0, 0.7, 0.05]}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSold) {
            onToggle(label, price);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = isSold ? 'not-allowed' : 'pointer';
          onHover({
            label,
            row,
            number: seatNum,
            category: isSold
              ? 'Booked Seat'
              : isReclinerRow
              ? 'VIP Sofa Recliner'
              : category === 'premium'
              ? 'Plush Sofa Club'
              : 'Classic Cinema Sofa',
            price: isSold ? 0 : isReclinerRow ? 400 : price,
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          onUnhover();
        }}
      />

      {/* 2. Sofa Seat Cushion Base */}
      <mesh geometry={geoms.cushion} material={seatMat} position={[0, 0.44, 0]} />

      {/* 3. Lower Lumbar Sofa Backrest */}
      <mesh
        geometry={geoms.backrest}
        material={seatMat}
        position={[0, 0.82, 0.30]}
        rotation={[-0.10, 0, 0]}
      />

      {/* 4. Upper Ergonomic Headrest Pillow Cushion */}
      {!isMySeat && (
        <mesh
          geometry={geoms.headrest}
          material={seatMat}
          position={[0, 1.20, 0.34]}
          rotation={[-0.10, 0, 0]}
        />
      )}

      {/* 5. Left Armrest & Cupholder */}
      <group position={[-0.41, 0.54, 0.02]}>
        <mesh geometry={geoms.armrest} material={mats.armrest} />
        <mesh geometry={geoms.cupholder} material={mats.cupholder} position={[0, 0.19, -0.24]} />
      </group>

      {/* 6. Right Armrest & Cupholder */}
      <group position={[0.41, 0.54, 0.02]}>
        <mesh geometry={geoms.armrest} material={mats.armrest} />
        <mesh geometry={geoms.cupholder} material={mats.cupholder} position={[0, 0.19, -0.24]} />
      </group>

      {/* 7. Solid Grounded Recliner Base Plinth */}
      <mesh geometry={geoms.plinth} material={mats.plinth} position={[0, 0.16, 0.04]} />

      {/* 8. Sitting Human Patron Inside Booked (White) Seats */}
      {isSold && !isMySeat && (
        <group position={[0, 0.56, 0.05]}>
          <mesh
            geometry={geoms.patronTorso}
            material={patronMats.clothes[clothesIdx]}
            position={[0, 0.32, 0.02]}
          />
          <mesh
            geometry={geoms.patronHead}
            material={patronMats.skin[skinIdx]}
            position={[0, 0.70, 0.04]}
          />
          <mesh
            geometry={geoms.patronHair}
            material={patronMats.hair[hairIdx]}
            position={[0, 0.76, 0.02]}
          />
          <mesh
            geometry={geoms.patronArm}
            material={patronMats.clothes[clothesIdx]}
            position={[-0.30, 0.24, 0.08]}
          />
          <mesh
            geometry={geoms.patronArm}
            material={patronMats.clothes[clothesIdx]}
            position={[0.30, 0.24, 0.08]}
          />
          <mesh geometry={geoms.patronLeg} material={patronMats.pants} position={[-0.14, 0.04, -0.22]} />
          <mesh geometry={geoms.patronLeg} material={patronMats.pants} position={[0.14, 0.04, -0.22]} />
        </group>
      )}

      {/* 9. Selected Indicator Halo */}
      {isSelected && (
        <group>
          <mesh geometry={geoms.haloRing} material={mats.haloMat} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          {!isMySeat && (
            <mesh geometry={geoms.haloDot} material={mats.haloMat} position={[0, 1.48, 0.34]} />
          )}
        </group>
      )}
    </group>
  );
});

export default function CinemaSeats({ seats, onSeatClick }: CinemaSeatsProps) {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const setHoveredSeatInfo = useBookingStore((s) => s.setHoveredSeatInfo);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const preset = useBookingStore((s) => s.cameraPreset);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Seat state lookup map
  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach((s) => map.set(s.label, s));
    return map;
  }, [seats]);

  // Shared Geometries (Created ONCE for all 338 seats)
  const sharedGeometries = useMemo(() => {
    return {
      cushion: new THREE.BoxGeometry(0.74, 0.24, 0.76),
      backrest: new THREE.BoxGeometry(0.72, 0.54, 0.16),
      headrest: new THREE.BoxGeometry(0.66, 0.28, 0.14),
      armrest: new THREE.BoxGeometry(0.10, 0.38, 0.72),
      cupholder: new THREE.CylinderGeometry(0.038, 0.034, 0.04, 10),
      plinth: new THREE.BoxGeometry(0.70, 0.30, 0.64),
      hitBox: new THREE.BoxGeometry(0.86, 1.45, 0.86),
      patronTorso: new THREE.BoxGeometry(0.48, 0.52, 0.28),
      patronHead: new THREE.SphereGeometry(0.14, 12, 12),
      patronHair: new THREE.SphereGeometry(0.145, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      patronArm: new THREE.BoxGeometry(0.10, 0.36, 0.28),
      patronLeg: new THREE.BoxGeometry(0.15, 0.22, 0.32),
      haloRing: new THREE.RingGeometry(0.44, 0.54, 24),
      haloDot: new THREE.SphereGeometry(0.07, 12, 12),
    };
  }, []);

  // Shared Materials (Created ONCE for all 338 seats)
  const sharedMaterials = useMemo(() => {
    return {
      hitBox: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
      armrest: new THREE.MeshStandardMaterial({ color: '#1a1c24', roughness: 0.4, metalness: 0.2 }),
      cupholder: new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 }),
      plinth: new THREE.MeshStandardMaterial({ color: '#0f1117', roughness: 0.9, metalness: 0.4 }),
      available: new THREE.MeshStandardMaterial({
        color: '#be123c',
        roughness: 0.42,
        metalness: 0.1,
      }),
      sold: new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.55,
        metalness: 0.05,
      }),
      selected: new THREE.MeshStandardMaterial({
        color: '#10b981',
        emissive: '#059669',
        emissiveIntensity: 0.8,
        roughness: 0.35,
      }),
      hovered: new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#b45309',
        emissiveIntensity: 0.5,
        roughness: 0.45,
      }),
      haloMat: new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide }),
    };
  }, []);

  // Shared Patron Materials
  const patronMats = useMemo(() => {
    const clothesColors = ['#1e293b', '#2563eb', '#047857', '#b45309', '#475569', '#be185d', '#4338ca'];
    const skinColors = ['#f1c27d', '#e0ac69', '#d4a373', '#c68642'];
    const hairColors = ['#18181b', '#291e14', '#3d2614', '#1c1917'];

    return {
      clothes: clothesColors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })),
      skin: skinColors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })),
      hair: hairColors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })),
      pants: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }),
    };
  }, []);

  const handleToggle = useCallback(
    (label: string, price: number) => {
      toggleSeat(label, price);
      if (onSeatClick) onSeatClick(label, price);
    },
    [toggleSeat, onSeatClick]
  );

  const handleHover = useCallback(
    (info: any) => {
      setHoveredSeat(info.label);
      setHoveredSeatInfo(info);
    },
    [setHoveredSeatInfo]
  );

  const handleUnhover = useCallback(() => {
    setHoveredSeat(null);
    setHoveredSeatInfo(null);
  }, [setHoveredSeatInfo]);

  // 13 Rows: A to M
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  return (
    <group>
      {rows.map((row) => {
        const isReclinerRow = row === 'L' || row === 'M';
        const rIdx = row.charCodeAt(0) - 65;

        return (
          <group key={`row-${row}`}>
            {Array.from({ length: 26 }, (_, colIdx) => {
              const seatNum = colIdx + 1;
              const label = `${row}${seatNum}`;
              const seatData = seatMap.get(label);

              const category = seatData?.category || (isReclinerRow ? 'recliner' : row >= 'E' ? 'premium' : 'standard');
              const price = seatData?.price || (category === 'recliner' ? 400 : category === 'premium' ? 240 : 150);

              // Realistic default booking pattern
              const defaultSold =
                rIdx >= 2 &&
                (((seatNum * 7 + rIdx * 13 + (seatNum % 3) * 5) % 100) < 32);

              const isSold = (seatData && seatData.status === 'sold') || defaultSold;
              const isSelected = selectedSeats.includes(label);
              const isHovered = hoveredSeat === label;
              const isMySeat = preset === 'My Seat' && activeSeat === label;
              const coords = getSeatCoordinates(label);

              return (
                <SeatItem
                  key={label}
                  label={label}
                  row={row}
                  seatNum={seatNum}
                  rIdx={rIdx}
                  category={category}
                  price={price}
                  isSold={isSold}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isMySeat={isMySeat}
                  coords={coords}
                  geoms={sharedGeometries}
                  mats={sharedMaterials}
                  patronMats={patronMats}
                  onToggle={handleToggle}
                  onHover={handleHover}
                  onUnhover={handleUnhover}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
