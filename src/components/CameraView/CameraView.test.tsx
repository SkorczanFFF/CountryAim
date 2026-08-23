import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CameraView } from '~/components/CameraView/CameraView';

describe('CameraView', () => {
  it('attaches and detaches the stream', () => {
    // happy-dom type-checks srcObject, so this has to be a real MediaStream.
    const stream = new MediaStream();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    const { container, unmount } = render(<CameraView stream={stream} />);
    const video = container.querySelector('video');

    expect(video?.srcObject).toBe(stream);
    unmount();
    expect(video?.srcObject).toBeNull();
  });
});
