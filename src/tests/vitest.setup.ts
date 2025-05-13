import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Optional: extend expect with more matchers (jest-dom is already imported above)

// Optional: mock common global objects if needed (e.g., localStorage)
beforeEach(() => {
  // Reset DOM or global state if needed between tests
  localStorage.clear();
});

// Optional: setup any global mocks
// Example: Mock `window.scrollTo` if used in components
window.scrollTo = vi.fn();
