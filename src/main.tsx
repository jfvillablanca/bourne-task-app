import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// @ts-expect-error Used by mockServiceWorker and has no declaration file
import { worker } from './mocks/browser';
import App from './App.tsx';

import './styles/globals.css';

async function main() {
    if (import.meta.env.DEV) {
        await worker.start();
    }

    const queryClient = new QueryClient();

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
                <ReactQueryDevtools />
            </QueryClientProvider>
        </React.StrictMode>,
    );
}
main();
