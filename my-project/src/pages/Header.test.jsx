import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './Header.jsx';
import contractReducer, { setUserAddress, setConnectionStatus } from '../redux/contractSlice';
import { initializeContractInstance } from '../contractInstance';

let store;

vi.mock('../contractInstance', () => ({ initializeContractInstance: vi.fn() }));

const account = '0x12345678901234567890123456789012abcd89ef';

const roleHashes = {
  GOVERNMENT_ROLE: '0xgov',
  SUPPLIER_ROLE: '0xsupplier',
  MANUFACTURER_ROLE: '0xmanufacturer',
  THIRD_PARTY_ROLE: '0xthird',
  RECYCLER_ROLE: '0xrecycler',
  MINER_ROLE: '0xminer',
};

const roleResults = {
  '0xgov': true,
  '0xsupplier': false,
  '0xmanufacturer': true,
  '0xthird': false,
  '0xrecycler': false,
  '0xminer': true,
};

function createMockContract() {
  const methods = {
    hasRole: vi.fn((hash) => ({ call: vi.fn().mockResolvedValue(roleResults[hash]) })),
  };
  for (const [role, hash] of Object.entries(roleHashes)) {
    methods[role] = () => ({ call: vi.fn().mockResolvedValue(hash) });
  }
  return { methods };
}

beforeEach(() => {
  // create a fresh store for each test
  store = configureStore({ reducer: { contract: contractReducer } });
  store.dispatch(resetAccount());

  // mock window.ethereum
  global.window.ethereum = {
    request: vi.fn(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve([]);
      if (method === 'eth_requestAccounts') return Promise.resolve([account]);
      return Promise.resolve([]);
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
  };

  // mock contract initialization
  initializeContractInstance.mockResolvedValue({
    evContract: createMockContract(),
    signatureManager: { methods: { hasRole: vi.fn((hash) => ({ call: vi.fn().mockResolvedValue(roleResults[hash]) })) } },
    account,
  });
});

describe('Header wallet connection', () => {
  it('connects wallet and updates store and UI', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const button = getByText(/connect wallet/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByText('0x12...89ef')).toBeTruthy();
    });

    const state = store.getState().contract;
    expect(state.account).toBe(account);
    expect(state.hasGovernmentRole).toBe(true);
    expect(state.hasSupplierRole).toBe(false);
    expect(state.hasManufacturerRole).toBe(true);
    expect(state.hasThirdPartyRole).toBeUndefined();
    expect(state.hasRecyclerRole).toBe(false);
    expect(state.hasMinerRole).toBe(true);
  });
});
