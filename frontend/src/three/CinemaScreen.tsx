'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useBookingStore } from '@/store/useBookingStore';

interface CinemaScreenProps {
  trailerUrl?: string;
  isMobile?: boolean;
}

export default function CinemaScreen({ trailerUrl, isMobile = false }: CinemaScreenProps) {
  const soundEnabled = useBookingStore((s) => s.soundEnabled);
  const videoPlaying = useBookingStore((s) => s.videoPlaying);
  const houseLights = useBookingStore((s) => s.houseLights);
  const selectedMovie = useBookingStore((s) => s.selectedMovie);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [posterTexture, setPosterTexture] = useState<THREE.Texture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Curved IMAX Cinema Screen Geometry (Concave towards audience)
  const curvedScreenGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(24.6, 11.2, 48, 8);
    const pos = geom.attributes.position;
    const curveRadius = 42.0;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const zOffset = curveRadius - Math.sqrt(Math.max(0, curveRadius * curveRadius - x * x));
      pos.setZ(i, zOffset);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 2. Matching Curved Matte Black Bezel Frame
  const curvedBezelGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(25.4, 11.8, 48, 8);
    const pos = geom.attributes.position;
    const curveRadius = 42.0;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const zOffset = curveRadius - Math.sqrt(Math.max(0, curveRadius * curveRadius - x * x));
      pos.setZ(i, zOffset - 0.08);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 3. Curved LED Halo Backlight Rim (Ambient glow behind the screen frame)
  const curvedHaloGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(25.8, 12.2, 48, 8);
    const pos = geom.attributes.position;
    const curveRadius = 42.0;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const zOffset = curveRadius - Math.sqrt(Math.max(0, curveRadius * curveRadius - x * x));
      pos.setZ(i, zOffset - 0.12);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Load Poster Texture as standby display
  useEffect(() => {
    const posterSrc = selectedMovie?.posterUrl || '/posters/Amaran.jpg';
    const loader = new THREE.TextureLoader();
    loader.load(
      posterSrc,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setPosterTexture(tex);
      },
      undefined,
      () => {
        loader.load(posterSrc.replace('/media/posters/', '/posters/'), (fallbackTex) => {
          fallbackTex.minFilter = THREE.LinearFilter;
          fallbackTex.magFilter = THREE.LinearFilter;
          setPosterTexture(fallbackTex);
        });
      }
    );
  }, [selectedMovie]);

  // Video Texture Setup
  useEffect(() => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = !soundEnabled;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    (video as any).disablePictureInPicture = true;
    (video as any).disableRemotePlayback = true;

    // Resolve direct static URL to bypass proxy lag and enable instant hardware decoding
    const resolveVideoUrl = (raw?: string): string => {
      const fallback = '/trailers/Amaran.mp4';
      if (!raw) return fallback;
      if (raw.startsWith('/media/trailers/')) {
        return raw.replace('/media/trailers/', '/trailers/');
      }
      return raw;
    };

    video.src = resolveVideoUrl(trailerUrl);

    const onCanPlay = () => {
      if (useBookingStore.getState().videoPlaying) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };
    video.addEventListener('canplay', onCanPlay);

    // Auto-recover if network or buffer stalls
    const onStalled = () => {
      if (useBookingStore.getState().videoPlaying) {
        video.play().catch(() => {});
      }
    };
    video.addEventListener('stalled', onStalled);
    video.load();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.format = THREE.RGBAFormat;

    videoRef.current = video;
    setVideoTexture(texture);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        if (useBookingStore.getState().videoPlaying) {
          video.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('stalled', onStalled);
      video.pause();
      video.removeAttribute('src');
      video.load();
      texture.dispose();
      videoRef.current = null;
    };
  }, [trailerUrl]);

  // Audio mute/unmute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
      if (soundEnabled && videoPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [soundEnabled, videoPlaying]);

  // Play / Pause
  useEffect(() => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [videoPlaying]);

  return (
    <group position={[0, 6.2, -17.5]}>
      {/* 1. Curved Screen Frame Border LED Halo Backlight */}
      <mesh geometry={curvedHaloGeometry}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Curved Matte Black Screen Bezel Frame */}
      <mesh geometry={curvedBezelGeometry}>
        <meshStandardMaterial color="#020306" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Main Curved 3D Cinema Screen Surface */}
      <mesh geometry={curvedScreenGeometry}>
        {videoTexture && videoPlaying ? (
          <meshBasicMaterial map={videoTexture} side={THREE.DoubleSide} />
        ) : posterTexture ? (
          <meshBasicMaterial map={posterTexture} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color="#11141c" emissive="#060910" roughness={0.5} side={THREE.DoubleSide} />
        )}
      </mesh>

      {/* 4. Elegant Red Velvet Proscenium Curtains Framing the Screen */}
      {/* Top Header Valence Curtain */}
      <group position={[0, 6.4, 0.1]}>
        <mesh>
          <boxGeometry args={[26.4, 1.2, 0.4]} />
          <meshStandardMaterial
            color="#8b0f18"
            emissive="#3a060a"
            emissiveIntensity={0.15}
            roughness={0.7}
          />
        </mesh>
        {/* Gold fringe trim */}
        <mesh position={[0, -0.6, 0.21]}>
          <boxGeometry args={[26.4, 0.04, 0.04]} />
          <meshBasicMaterial color="#f5c518" />
        </mesh>
      </group>

      {/* Left and Right Flanking Red Velvet Drapes */}
      {[-13.2, 13.2].map((xCurtain, cIdx) => (
        <group key={`screen-curtain-drape-${cIdx}`} position={[xCurtain, 0, 0.15]}>
          <mesh>
            <boxGeometry args={[1.6, 12.0, 0.35]} />
            <meshStandardMaterial
              color="#8b0f18"
              emissive="#3a060a"
              emissiveIntensity={0.15}
              roughness={0.7}
            />
          </mesh>
          {/* Gold inner edge trim */}
          <mesh position={[cIdx === 0 ? 0.8 : -0.8, 0, 0.18]}>
            <boxGeometry args={[0.04, 12.0, 0.04]} />
            <meshBasicMaterial color="#f5c518" />
          </mesh>
        </group>
      ))}

      {/* 5. Raised Cinema Stage Dais Podium */}
      <group position={[0, -5.75, 2.3]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[14.0, 0.45, 4.2]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[-9.8, 0.22, -0.45]} rotation={[0, 0.14, 0]}>
          <boxGeometry args={[7.2, 0.45, 4.2]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[9.8, 0.22, -0.45]} rotation={[0, -0.14, 0]}>
          <boxGeometry args={[7.2, 0.45, 4.2]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.45} metalness={0.15} />
        </mesh>

        {/* Polished Stage Dais Top Trim */}
        <mesh position={[0, 0.46, 2.12]}>
          <boxGeometry args={[14.2, 0.04, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[-9.8, 0.46, 1.68]} rotation={[0, 0.14, 0]}>
          <boxGeometry args={[7.3, 0.04, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[9.8, 0.46, 1.68]} rotation={[0, -0.14, 0]}>
          <boxGeometry args={[7.3, 0.04, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Glowing Warm Golden LED Cove Light */}
        <mesh position={[0, 0.42, 2.14]}>
          <boxGeometry args={[14.0, 0.03, 0.03]} />
          <meshBasicMaterial color="#f5c518" />
        </mesh>
        <mesh position={[-9.8, 0.42, 1.70]} rotation={[0, 0.14, 0]}>
          <boxGeometry args={[7.2, 0.03, 0.03]} />
          <meshBasicMaterial color="#f5c518" />
        </mesh>
        <mesh position={[9.8, 0.42, 1.70]} rotation={[0, -0.14, 0]}>
          <boxGeometry args={[7.2, 0.03, 0.03]} />
          <meshBasicMaterial color="#f5c518" />
        </mesh>

        {/* Stage Subwoofers / Monitors */}
        {[-11.5, 11.5].map((xSub, sIdx) => (
          <group key={`subwoofer-${sIdx}`} position={[xSub, 0.72, 0.4]} rotation={[0, sIdx === 0 ? 0.35 : -0.35, 0]}>
            <mesh>
              <boxGeometry args={[0.95, 1.15, 0.85]} />
              <meshStandardMaterial color="#07090e" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.43]}>
              <planeGeometry args={[0.85, 1.05]} />
              <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Screen Illumination Light Spill into auditorium */}
      <pointLight
        position={[0, 2.8, 6]}
        intensity={isMobile ? 0.6 : 0.85}
        distance={22}
        color="#e0e7ff"
      />
    </group>
  );
}
