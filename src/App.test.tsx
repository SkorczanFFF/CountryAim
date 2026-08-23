import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '~/App';

function withoutCamera() {
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: undefined,
    configurable: true,
  });
}

describe('App', () => {
  it('says why the camera did not start', () => {
    withoutCamera();
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CountryAim',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ta przeglądarka nie udostępnia kamery.',
    );
  });

  it('falls back to the capability probe when the camera fails', () => {
    withoutCamera();
    render(<App />);

    expect(screen.getAllByRole('listitem')).toHaveLength(11);
  });
});
