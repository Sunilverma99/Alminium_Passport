import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PassportQRCode from './PassportQRCode.jsx';

describe('PassportQRCode component', () => {
  it('renders QR code container', () => {
    const { container } = render(<PassportQRCode url="https://example.com" />);
    // ensure the component renders a container div
    const div = container.querySelector('div');
    expect(div).toBeTruthy();
  });
});
