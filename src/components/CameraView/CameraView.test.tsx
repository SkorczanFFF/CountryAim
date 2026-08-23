import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CameraView } from '~/components/CameraView/CameraView';

describe('CameraView', () => {
  it('attaches and detaches the stream', () => {
    // happy-dom type-checks srcObject, so this has to be a real MediaStream.
    const stream = new MediaStream();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    const onVideo = vi.fn();
    const { container, unmount } = render(
      <CameraView stream={stream} onVideo={onVideo} />,
    );
    const video = container.querySelector('video');

    expect(video?.srcObject).toBe(stream);
    expect(onVideo).toHaveBeenCalledWith(video);

    unmount();
    expect(video?.srcObject).toBeNull();
    expect(onVideo).toHaveBeenLastCalledWith(null);
  });
});
