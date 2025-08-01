import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
vi.mock('../contractInstance', () => ({ initializeContractInstance: vi.fn() }));
import Home from './Home.jsx';

describe('Home page', () => {
  it('renders Battery Passport text', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
    expect(getByText(/Battery Passport Initiative/i)).toBeTruthy();
  });
});
