'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useBookingStore } from '@/store/useBookingStore';
import { getSeatCoordinates } from './CinemaSeats';

export default function CameraController() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const preset = useBookingStore((s) => s.cameraPreset);
  const activeSeat = useBookingStore((s) => s.activeSeatEyeView);
  const isTouring = useBookingStore((s) => s.isTouring);
  const setIsTouring = useBookingStore((s) => s.setIsTouring);
  const zoomCommand = useBookingStore((s) => s.zoomCommand);

  // Target vectors for camera presets
  const desiredPos = useRef(new THREE.Vector3(-8.5, 10.5, 17.5));
  const desiredTarget = useRef(new THREE.Vector3(0, 3.8, 1));
  const isTransitioning = useRef(false);

  // Seat first-person look-around angles (Direct cursor lock, zero drift)
  const isSeatMode = preset === 'My Seat';
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const targetFOV = useRef(54);

  // Tour mode
  const tourAngle = useRef(0);
  const tourTarget = useRef(new THREE.Vector3(0, 3.8, 1));

  // Respond to camera preset changes
  useEffect(() => {
    isTransitioning.current = true;

    if (preset === 'My Seat' && activeSeat) {
      const [sx, sy, sz] = getSeatCoordinates(activeSeat);
      const rowChar = activeSeat.charAt(0).toUpperCase();
      const rIdx = Math.max(0, Math.min(12, rowChar.charCodeAt(0) - 65));

      desiredPos.current.set(sx, sy + 1.42, sz + 0.08);
      desiredTarget.current.set(0, 6.2, -17.5);

      currentYaw.current = 0;
      currentPitch.current = 0;

      if (rIdx <= 2) {
        targetFOV.current = 62;
      } else if (rIdx <= 7) {
        targetFOV.current = 54;
      } else {
        targetFOV.current = 48;
      }
    } else {
      targetFOV.current = 54;
      switch (preset) {
        case 'Overview': {
          const isMob = typeof window !== 'undefined' && window.innerWidth < 768;
          if (isMob) {
            desiredPos.current.set(-4.5, 12.0, 19.5);
            desiredTarget.current.set(0, 3.8, 1);
            targetFOV.current = 62;
          } else {
            desiredPos.current.set(-8.5, 10.5, 17.5);
            desiredTarget.current.set(0, 3.8, 1);
            targetFOV.current = 54;
          }
          break;
        }

        case 'Near screen':
          desiredPos.current.set(0, 2.6, -10.5);
          desiredTarget.current.set(0, 6.2, -17.5);
          break;

        case 'Balcony':
          desiredPos.current.set(0, 12.8, 18.2);
          desiredTarget.current.set(0, 5.2, -17.5);
          break;

        case 'Top view':
          desiredPos.current.set(0, 14.2, 3);
          desiredTarget.current.set(0, 0, 3);
          break;

        case 'From Stage':
          desiredPos.current.set(0, 2.8, -12.5);
          desiredTarget.current.set(0, 4.5, 6);
          break;

        default:
          desiredPos.current.set(-8.5, 10.5, 17.5);
          desiredTarget.current.set(0, 3.8, 1);
          break;
      }
    }
  }, [preset, activeSeat]);

  // Handle zoom HUD commands
  useEffect(() => {
    if (!zoomCommand) return;

    if (zoomCommand === 'reset') {
      desiredPos.current.set(-8.5, 10.5, 17.5);
      desiredTarget.current.set(0, 3.8, 1);
      isTransitioning.current = true;
    } else if (controlsRef.current) {
      const zoomFactor = zoomCommand === 'in' ? 0.8 : 1.25;
      const cam = camera;
      const target = controlsRef.current.target;
      const offset = cam.position.clone().sub(target);
      offset.multiplyScalar(zoomFactor);
      if (offset.length() > 3.0 && offset.length() < 25.0) {
        cam.position.copy(target.clone().add(offset));
        controlsRef.current.update();
      }
    }

    useBookingStore.setState({ zoomCommand: null });
  }, [zoomCommand, camera]);

  // Direct 1:1 Look-around in Seat View (Stops immediately on mouse release)
  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;

    const onPointerDown = (e: PointerEvent) => {
      if (isTouring) {
        setIsTouring(false);
      }
      if (preset !== 'My Seat') return;
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || preset !== 'My Seat') return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      prevPointer.current = { x: e.clientX, y: e.clientY };

      // Direct, responsive cursor tracking
      const sensitivity = 0.0028;
      currentYaw.current -= dx * sensitivity;
      currentPitch.current = Math.max(-0.75, Math.min(0.75, currentPitch.current - dy * sensitivity));
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (preset !== 'My Seat') return;
      e.preventDefault();
      targetFOV.current = Math.max(30, Math.min(74, targetFOV.current + (e.deltaY > 0 ? 3 : -3)));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl, preset, isTouring, setIsTouring]);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05);

    // Smooth Optical Zoom FOV
    if ('fov' in camera) {
      const persCam = camera as THREE.PerspectiveCamera;
      if (Math.abs(persCam.fov - targetFOV.current) > 0.05) {
        persCam.fov = THREE.MathUtils.lerp(persCam.fov, targetFOV.current, safeDelta * 8);
        persCam.updateProjectionMatrix();
      }
    }

    // Tour Mode
    if (isTouring) {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      tourAngle.current += safeDelta * 0.22;
      const t = tourAngle.current;

      const tx = Math.sin(t) * 9.2;
      const tz = 2.0 + Math.cos(t) * 12.5;
      const ty = 6.8 + Math.cos(t) * 4.2;

      camera.position.lerp(new THREE.Vector3(tx, ty, tz), Math.min(safeDelta * 5.0, 1));

      const targetZ = -0.5 - Math.cos(t) * 13.5;
      const targetX = -Math.sin(t) * 1.5;
      const targetY = 5.0 - Math.cos(t) * 0.6;
      tourTarget.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), Math.min(safeDelta * 5.0, 1));

      camera.lookAt(tourTarget.current);
      return;
    }

    // My Seat Mode: Camera firmly anchored in seat, rotating strictly with user's cursor
    if (isSeatMode) {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      // Smooth transition into seat
      if (isTransitioning.current) {
        camera.position.lerp(desiredPos.current, Math.min(safeDelta * 6.0, 1));
        if (camera.position.distanceTo(desiredPos.current) < 0.05) {
          isTransitioning.current = false;
          camera.position.copy(desiredPos.current);
        }
      } else {
        camera.position.copy(desiredPos.current);
      }

      // Clean spherical look-at vector pointing directly towards screen + user yaw/pitch
      const cp = Math.cos(currentPitch.current);
      const sp = Math.sin(currentPitch.current);
      const cy = Math.cos(currentYaw.current);
      const sy = Math.sin(currentYaw.current);

      // Facing screen (-Z) at baseline
      const forward = new THREE.Vector3(sy * cp, sp, -cy * cp);
      camera.lookAt(camera.position.clone().add(forward.multiplyScalar(20)));
      return;
    }

    // Standard OrbitControls: Direct cursor control (enableDamping=false means NO CONTINUOUS DRIFT!)
    if (controlsRef.current) {
      controlsRef.current.enabled = true;

      if (isTransitioning.current) {
        camera.position.lerp(desiredPos.current, Math.min(safeDelta * 6.0, 1));
        controlsRef.current.target.lerp(desiredTarget.current, Math.min(safeDelta * 6.0, 1));

        if (
          camera.position.distanceTo(desiredPos.current) < 0.08 &&
          controlsRef.current.target.distanceTo(desiredTarget.current) < 0.08
        ) {
          isTransitioning.current = false;
          camera.position.copy(desiredPos.current);
          controlsRef.current.target.copy(desiredTarget.current);
        }
      }

      controlsRef.current.update();

      // Boundary clamp
      camera.position.x = Math.max(-14.0, Math.min(14.0, camera.position.x));
      camera.position.y = Math.max(1.5, Math.min(16.0, camera.position.y));
      camera.position.z = Math.max(-14.0, Math.min(24.0, camera.position.z));
    }
  });

  // Cancel transition on user interaction so touch rotation is instant
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      isTransitioning.current = false;
    };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.12}
      enableZoom={true}
      zoomSpeed={1.0}
      rotateSpeed={1.0}
      panSpeed={0.8}
      minDistance={3.0}
      maxDistance={28.0}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI * 0.49}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
