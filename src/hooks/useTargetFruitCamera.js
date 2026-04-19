import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useCameraDevice } from 'react-native-vision-camera';
import storage from '@react-native-firebase/storage';

const CAMERA_CAPTURE_INTERVAL_MS = 500;

export function useTargetFruitCamera(isTargetVisible, sessionId) {
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const capturedImageUrls = useRef([]);
  const isCaptureActive = useRef(false);

  const device = useCameraDevice('front');

  const capture = useCallback(async () => {
    console.log('Capturing image...');
    
    if (!cameraRef.current || isCaptureActive.current) return;
    isCaptureActive.current = true;
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const uri =
        Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
      const fileName = `sessions/${sessionId}/camera_${Date.now()}.jpg`;
      const ref = storage().ref(fileName);
      await ref.putFile(uri);
      const url = await ref.getDownloadURL();
      capturedImageUrls.current.push(url);
    } catch (e) {
      console.warn('[Camera] capture failed:', e?.message);
    } finally {
      isCaptureActive.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (isTargetVisible) {
      capture();      
      intervalRef.current = setInterval(capture, CAMERA_CAPTURE_INTERVAL_MS);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isTargetVisible, capture]);

  return { cameraRef, cameraDevice: device, capturedImageUrls };
}
