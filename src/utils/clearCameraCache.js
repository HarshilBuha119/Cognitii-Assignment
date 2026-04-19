import { Platform } from 'react-native';

export async function clearCameraCache(photoPaths = []) {
  if (!photoPaths.length) return;

  let deleted = 0;
  for (const path of photoPaths) {
    try {
      const uri = Platform.OS === 'android' ? `file://${path}` : path;
      await fetch(uri, { method: 'DELETE' });
      deleted++;
    } catch (e) {
      // Non-fatal — cache will be cleared by OS eventually anyway
      console.warn('[CameraCache] Could not delete:', path);
    }
  }
  console.log(`[CameraCache] 🧹 Cleared ${deleted}/${photoPaths.length} cached photos`);
}