import '@testing-library/jest-dom';

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
