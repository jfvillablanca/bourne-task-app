import { setupServer } from 'msw/node';

import { screen, waitFor } from '@testing-library/react';

import App from '../App';
import { handlers } from '../mocks/handlers';

import { renderWithClient } from './utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('App', () => {
    it('should render all project titles', async () => {
        const result = renderWithClient(<App />);

        await waitFor(() => result.findByText(/project list/i));

        const projectTitles = screen
            .getAllByRole('listitem')
            .map((project) => project.textContent);

        expect(projectTitles).toHaveLength(5);
    });
});
