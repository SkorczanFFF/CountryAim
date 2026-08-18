import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '~/App';

describe('App', () => {
  it('renders the app name and the capability panel', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CountryAim',
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Device capabilities',
    );
  });

  it('lists one row per probed capability', () => {
    render(<App />);

    expect(screen.getAllByRole('listitem')).toHaveLength(11);
  });
});
