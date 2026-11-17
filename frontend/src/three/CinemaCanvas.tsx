'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import CinemaRoom from './CinemaRoom';
import CinemaScreen from './CinemaScreen';
import CinemaSeats from './CinemaSeats';
import CameraController from './CameraController';
import { Seat } from '@/types';

interface CinemaCanvasProps {
  trailerUrl?: string;
  seats: Seat[];
  onSeatClick?: (seatLabel: string, price: number) => void;
}

export default function CinemaCanvas({ trailerUrl, seats, onSeatClick }: CinemaCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#040508]">
      <Canvas
        camera={{
          position: [0, 16.5, 27],
          fov: isMobile ? 60 : 54,
          near: 0.1,
          far: 140,
        }}
        dpr={isMobile ? [1, 1.1] : [1, 1.25]}
        performance={{ min: 0.7 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#040508');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <CameraController />
        <CinemaRoom isMobile={isMobile} />
        <CinemaScreen trailerUrl={trailerUrl} isMobile={isMobile} />
        <CinemaSeats seats={seats} onSeatClick={onSeatClick} />
      </Canvas>
    </div>
  );
}
