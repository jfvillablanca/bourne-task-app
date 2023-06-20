import { setupServer } from 'msw/node';

import { screen, waitFor } from '@testing-library/react';

import { Sidebar } from '../components';

import { handlers, renderWithClient } from './utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('Sidebar', () => {
    it('should render all project titles', async () => {
        const result = renderWithClient(<Sidebar />);

        await waitFor(() => result.findByText(/project list/i));

        const projectTitles = screen
            .getAllByRole('listitem')
            .map((project) => project.textContent);

        expect(projectTitles).toHaveLength(5);
    });
});
