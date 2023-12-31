/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/bourne-task-app/',
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        setupFiles: './setupTests.ts',
        deps: {
            inline: ['vitest-canvas-mock'],
        },
        threads: false,
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            }
        }
    },
});
