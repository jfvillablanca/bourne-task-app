import { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () =>
    new QueryClient({
        logger: {
            log: console.log,
            warn: console.warn,
            error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
        },
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

// Used for hooks testing
export function createWrapper() {
    const testQueryClient = createTestQueryClient();
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    );
}

// Used for component testing
export function renderWithClient(ui: React.ReactElement) {
    const testQueryClient = createTestQueryClient();
    const { rerender, ...result } = render(
        <QueryClientProvider client={testQueryClient}>
            {ui}
        </QueryClientProvider>,
    );
    return {
        ...result,
        rerender: (rerenderUi: React.ReactElement) =>
            rerender(
                <QueryClientProvider client={testQueryClient}>
                    {rerenderUi}
                </QueryClientProvider>,
            ),
    };
}
