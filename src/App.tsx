import { useState } from 'react';
import { CameraView } from '~/components/CameraView/CameraView';
import { CapabilityReport } from '~/components/CapabilityReport/CapabilityReport';
import { ScannerOverlay } from '~/components/ScannerOverlay/ScannerOverlay';
import { useCapabilities } from '~/hooks/useCapabilities';
import { t } from '~/i18n/t';
import type { Scan } from '~/scanner/detector';
import { useCamera } from '~/scanner/useCamera';
import { useScanLoop } from '~/scanner/useScanLoop';
import styles from './App.module.css';

export default function App() {
  const camera = useCamera();
  const { capabilities, missingRequired } = useCapabilities();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [scan, setScan] = useState<Scan | null>(null);

  useScanLoop(video, setScan);

  if (camera.status === 'ready') {
    return (
      <CameraView stream={camera.stream} onVideo={setVideo}>
        <ScannerOverlay />
        {/* Raw reading for now; the frozen frame and the country arrive next. */}
        {scan && <p className={styles.reading}>{scan.value}</p>}
      </CameraView>
    );
  }

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>{t('app.name')}</h1>

      <p className={styles.status} role="status">
        {camera.status === 'starting'
          ? t('camera.starting')
          : t(`camera.error.${camera.reason}`)}
      </p>

      {/* The probe is worth its place exactly here: when the camera will not
          start, the next question is always what this device actually has. */}
      {camera.status === 'error' && (
        <CapabilityReport
          capabilities={capabilities}
          missingRequired={missingRequired}
        />
      )}

      <p className={styles.version}>v{__APP_VERSION__}</p>
    </main>
  );
}
