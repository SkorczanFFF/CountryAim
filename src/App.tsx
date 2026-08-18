import { CapabilityReport } from '~/components/CapabilityReport/CapabilityReport';
import { useCapabilities } from '~/hooks/useCapabilities';
import styles from './App.module.css';

export default function App() {
  const { capabilities, missingRequired } = useCapabilities();

  return (
    <main className={styles.app}>
      <header>
        <h1 className={styles.title}>CountryAim</h1>
        <p className={styles.lede}>
          <span className={styles.version}>v{__APP_VERSION__}</span> scaffold.
          Open this on the phone you plan to test with: everything the scanner
          depends on is listed below.
        </p>
      </header>

      <CapabilityReport
        capabilities={capabilities}
        missingRequired={missingRequired}
      />
    </main>
  );
}
