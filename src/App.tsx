import { useState } from 'react';
import { CameraView } from '~/components/CameraView/CameraView';
import { CapabilityReport } from '~/components/CapabilityReport/CapabilityReport';
import { Flags } from '~/components/Flags/Flags';
import { Readout } from '~/components/Readout/Readout';
import { ScannerOverlay } from '~/components/ScannerOverlay/ScannerOverlay';
import { useCapabilities } from '~/hooks/useCapabilities';
import { describeReading } from '~/i18n/reading';
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

  const decoder = useScanLoop(video, setScan);
  const reading = scan && describeReading(scan);

  if (camera.status === 'ready') {
    return (
      <CameraView stream={camera.stream} onVideo={setVideo}>
        <ScannerOverlay />
        <p className={styles.mark}>
          <img className={styles.brand} src="/favicon.svg" alt="" />
          {t('app.name')}
        </p>
        {reading ? (
          // Keyed on the code so a new reading replays both entrances.
          <>
            <Flags key={`f${scan?.value}`} isos={reading.isos} />
            <Readout
              key={`r${scan?.value}`}
              reading={reading}
              decoder={decoder}
            />
          </>
        ) : (
          <p className={styles.hint}>{t('scanner.hint')}</p>
        )}
      </CameraView>
    );
  }

  return (
    <main className={styles.app}>
      <header className={styles.head}>
        <h1 className={styles.wordmark}>
          <img className={styles.brand} src="/favicon.svg" alt="" />
          {t('app.name')}
        </h1>
        <p className={styles.build}>v{__APP_VERSION__}</p>
      </header>

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
    </main>
  );
}
