import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AuthLoader from './components/AuthLoader.tsx';
// @ts-expect-error Used by mockServiceWorker and has no declaration file
import { worker } from './mocks/browser';
import { populateMockDatabase } from './tests/utils';
import App from './App.tsx';
import { queryClient } from './common';

import './index.css';

async function main() {
    if (import.meta.env.DEV) {
        populateMockDatabase();
        await worker.start();
    }

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <AuthLoader>
                    <App />
                </AuthLoader>
                <ReactQueryDevtools />
            </QueryClientProvider>
        </React.StrictMode>,
    );
}
main();
