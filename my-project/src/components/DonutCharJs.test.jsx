import React from 'react';
import { render, screen } from '@testing-library/react';
import DonutChart from './DonutCharJs.jsx';
import { describe, test, expect, beforeAll } from 'vitest';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class {
    constructor(callback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('DonutChart Component', () => {
  const backendData = {
    material: 'Copper',
    totalRecycledShare: 75,
    shares: [
      { label: 'Pre-consumer', value: 30 },
      { label: 'Post-consumer', value: 45 },
      { label: 'Virgin', value: 25 },
      { label: 'Other', value: 0 },
    ],
  };

  test('shows loading when data is missing or invalid', () => {
    const { rerender } = render(<DonutChart backendData={null} />);
    expect(screen.getByText(/loading/i)).toBeTruthy();

    rerender(<DonutChart backendData={{}} />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  test('displays title, material name, and total recycled share', () => {
    render(<DonutChart backendData={backendData} />);
    expect(screen.getByText(/recycled content share/i)).toBeTruthy();
    expect(screen.getByText('Copper')).toBeTruthy();
    expect(screen.getByText(/75\s*%\s*Recycled/)).toBeTruthy();
  });

  test('shows warning when total percentage is not ~100%', () => {
    const invalid = { ...backendData, shares: [{ label: 'Only', value: 10 }] };
    render(<DonutChart backendData={invalid} />);
    expect(screen.getByText(/data may be incomplete/i)).toBeTruthy();
  });
});
