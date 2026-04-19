// src/hooks/useTargetFruitCamera.js
import { useRef, useCallback, useEffect } from 'react';
import { useCameraDevice } from 'react-native-vision-camera';

const CAMERA_CAPTURE_INTERVAL_MS = 500;

export function useTargetFruitCamera(isTargetVisible) {
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const capturedPhotoPaths = useRef([]);
  const isCaptureActive = useRef(false);

  const device = useCameraDevice('front');

  const capture = useCallback(async () => {
    if (isCaptureActive.current) return;
    // Poll until takePhoto is bound — happens async after native init
    if (!cameraRef.current || typeof cameraRef.current.takePhoto !== 'function') {
      console.log('[Camera] ⏳ Not ready yet, will retry on next interval');
      return;
    }
    isCaptureActive.current = true;
    try {
      const photo = await cameraRef.current.takePhoto({});
      capturedPhotoPaths.current.push(photo.path);
      console.log(`[Camera] 📸 Captured (${capturedPhotoPaths.current.length} total):`, photo.path);
    } catch (e) {
      console.warn('[Camera] ❌ takePhoto failed:', e?.message);
    } finally {
      isCaptureActive.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isTargetVisible) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    // Start interval immediately — capture() self-guards until ready
    intervalRef.current = setInterval(capture, CAMERA_CAPTURE_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isTargetVisible, capture]);

  return { cameraRef, cameraDevice: device, capturedPhotoPaths };
}