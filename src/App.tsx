import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView } from '~/components/CameraView/CameraView';
import { CapabilityReport } from '~/components/CapabilityReport/CapabilityReport';
import { Flags } from '~/components/Flags/Flags';
import { Readout } from '~/components/Readout/Readout';
import { ScannerOverlay } from '~/components/ScannerOverlay/ScannerOverlay';
import { useCapabilities } from '~/hooks/useCapabilities';
import { describeReading, type Reading } from '~/i18n/reading';
import { t } from '~/i18n/t';
import type { Scan } from '~/scanner/detector';
import { captureStill } from '~/scanner/freeze';
import { createStabiliser } from '~/scanner/stabilise';
import { useCamera } from '~/scanner/useCamera';
import { useScanLoop } from '~/scanner/useScanLoop';
import styles from './App.module.css';

/** The moment the loop stopped: the picture taken and what it turned out to be. */
type Frozen = { url: string; reading: Reading };

export default function App() {
  const camera = useCamera();
  const { capabilities, missingRequired } = useCapabilities();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [frozen, setFrozen] = useState<Frozen | null>(null);
  const capturing = useRef(false);
  // A streak of agreeing reads outlives renders and never appears on screen, so
  // it is a ref and not state — nothing here should cause a render until it says
  // the reading is settled.
  const agreeing = useRef(createStabiliser());

  const onScan = useCallback(
    (scan: Scan) => {
      const reading = describeReading(scan);
      // The first of §7.3's two gates. A decode that fails mod 10 is not a
      // reading, so it does not count towards agreement either.
      if (!reading.valid) return;
      // The second: reads in a row that say the same thing. One decode off a
      // creased label can pass the check digit by luck, and stopping the screen
      // on it hands the user a wrong country to dismiss.
      if (!agreeing.current.offer(scan.value, performance.now())) return;
      // The loop pauses on the state change, which is a frame or two away — the
      // decode that lands in between must not start a second capture.
      if (capturing.current || !video) return;

      capturing.current = true;
      captureStill(video).then((url) => {
        capturing.current = false;
        if (url) setFrozen({ url, reading });
      });
    },
    [video],
  );

  const decoder = useScanLoop(video, onScan, frozen !== null);

  useEffect(() => {
    if (!frozen) return;
    // A full-size JPEG per reading. Without this each one is held for the life
    // of the page, and this is a screen people use dozens of times in a row.
    return () => URL.revokeObjectURL(frozen.url);
  }, [frozen]);

  if (camera.status === 'ready') {
    return (
      <CameraView stream={camera.stream} onVideo={setVideo}>
        {/* The instrument stopped measuring, so the laser and the band go with
            it: what is on screen is a picture now, not a preview. */}
        {frozen ? (
          <img className={styles.still} src={frozen.url} alt="" />
        ) : (
          <ScannerOverlay />
        )}

        <p className={styles.mark}>
          <img className={styles.brand} src="/favicon.svg" alt="" />
          {t('app.name')}
          {/* The nameplate carries the model number. Testing happens on one
              branch address that is overwritten in place, so nothing else on
              this screen can say whether it is the build just pushed or the one
              the phone had cached. */}
          <span className={styles.stamp}>v{__APP_VERSION__}</span>
        </p>

        {frozen ? (
          // Keyed on the still, which is new every time, so both entrances replay.
          <>
            <Flags key={`f${frozen.url}`} isos={frozen.reading.isos} />
            <Readout
              key={`r${frozen.url}`}
              reading={frozen.reading}
              decoder={decoder}
              onClose={() => setFrozen(null)}
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
