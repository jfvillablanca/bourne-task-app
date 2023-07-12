import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import 'vitest-canvas-mock'
import resizeObserverPolyfill from 'resize-observer-polyfill'

global.ResizeObserver = resizeObserverPolyfill
expect.extend(matchers);

afterEach(() => {
    cleanup();
});
