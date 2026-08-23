import { CameraView } from '~/components/CameraView/CameraView';
import { CapabilityReport } from '~/components/CapabilityReport/CapabilityReport';
import { useCapabilities } from '~/hooks/useCapabilities';
import { t } from '~/i18n/t';
import { useCamera } from '~/scanner/useCamera';
import styles from './App.module.css';

export default function App() {
  const camera = useCamera();
  const { capabilities, missingRequired } = useCapabilities();

  if (camera.status === 'ready') return <CameraView stream={camera.stream} />;

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
