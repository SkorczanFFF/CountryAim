import { type ReactNode, useEffect, useRef } from 'react';
import styles from './CameraView.module.css';

type CameraViewProps = {
  stream: MediaStream;
  /** Handed the element so the scan loop can read frames from it. */
  onVideo: (video: HTMLVideoElement | null) => void;
  children?: ReactNode;
};

export function CameraView({ stream, onVideo, children }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    // Safari on iOS ignores autoplay often enough that the preview stays black
    // without this. The rejection when autoplay already started is not a fault.
    video.play().catch(() => {});
    onVideo(video);

    return () => {
      video.srcObject = null;
      onVideo(null);
    };
  }, [stream, onVideo]);

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
      {children}
    </div>
  );
}
