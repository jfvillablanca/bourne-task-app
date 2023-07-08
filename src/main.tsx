import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// @ts-expect-error Used by mockServiceWorker and has no declaration file
import { worker } from './mocks/browser';
import App from './App.tsx';
import { createQueryClient } from './common';
import { AuthenticationFullPage } from './components';

import './index.css';

async function main() {
    if (import.meta.env.DEV) {
        await worker.start();
    }

    // TODO: This is temporary.
    const accessToken = false;

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <QueryClientProvider client={createQueryClient()}>
                {!!accessToken ? <App /> : <AuthenticationFullPage />}
                <ReactQueryDevtools />
            </QueryClientProvider>
        </React.StrictMode>,
    );
}
main();
