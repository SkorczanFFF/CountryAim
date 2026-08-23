import { useEffect, useRef } from 'react';
import styles from './CameraView.module.css';

type CameraViewProps = { stream: MediaStream };

export function CameraView({ stream }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    // Safari on iOS ignores autoplay often enough that the preview stays black
    // without this. The rejection when autoplay already started is not a fault.
    video.play().catch(() => {});

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <div className={styles.stage}>
      {/* playsInline or iOS takes the video fullscreen and hides the overlay. */}
      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        muted
        autoPlay
      />
    </div>
  );
}
