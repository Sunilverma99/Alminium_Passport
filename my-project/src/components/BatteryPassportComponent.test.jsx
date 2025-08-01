import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import BatteryPassportComponent from "./BatteryPassportComponent1.jsx";

// Polyfill ResizeObserver and stub window.location
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Replace window.location for QR code logic
  delete window.location;
  window.location = { href: 'https://localhost' };
});

// Mock the evContract module to prevent undefined destructuring
vi.mock('../utils/evContract', () => ({
  default: {
    methods: {
      getBatteryPassport: () => ({
        call: () => Promise.resolve({
          materialCompositionHashes: [],
          carbonFootprintHashes:   [],
          performanceDataHashes:   [],
          circularityDataHashes:   [],
          labelsDataHashes:        [],
          dueDiligenceHashes:      [],
          generalProductInfoHashes:[],
        }),
      }),
    },
  },
}));

describe('BatteryPassportComponent', () => {
  it('shows a spinner while loading', () => {
    const { container } = render(<BatteryPassportComponent />);
    // Expect the loading spinner (animate-spin) to be present
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});
