import { HttpStatusCode } from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it } from 'vitest';

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { AuthenticationModal } from '../components';
import { handlers } from '../mocks/handlers';

import { renderWithClient } from './utils';

const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
});

afterAll(() => server.close());

describe('AppWide', () => {
    it('should render toast on successful registration', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<App />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const emailInput = result.getByPlaceholderText(/name@example.com/i);
        const passwordInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');
        const submitButton = result.getByRole('button', {
            name: 'Sign up with email',
        });

        await user.type(emailInput, 'iam@teapot.com');
        await user.type(passwordInput, 'password');
        await user.type(confirmPasswordInput, 'password');
        await user.click(submitButton);
        await waitFor(() =>
            expect(result.getByRole('alert')).toBeInTheDocument(),
        );

        const successToast = result.getByRole('alert');
        expect(successToast).toBeInTheDocument();
        expect(successToast).toHaveTextContent("You're all set! 🥳");
    });

    it('should render toast on successful login', async () => {
        // Register a user
        const user = userEvent.setup();
        const result = renderWithClient(<App />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const emailRegisterInput =
            result.getByPlaceholderText(/name@example.com/i);
        const passwordRegisterInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');
        const submitRegisterButton = result.getByRole('button', {
            name: 'Sign up with email',
        });

        await user.type(emailRegisterInput, 'iam@teapot.com');
        await user.type(passwordRegisterInput, 'password');
        await user.type(confirmPasswordInput, 'password');
        await user.click(submitRegisterButton);
        await waitFor(() =>
            expect(result.getByText("You're all set! 🥳")).toBeInTheDocument(),
        );

        // Login
        await user.click(userAuthButton);
        const loginTab = result.getByLabelText('login tab');
        await user.click(loginTab);

        const emailLoginInput =
            result.getByPlaceholderText(/name@example.com/i);
        const passwordLoginInput = result.getByPlaceholderText('Password');
        const submitLoginButton = result.getByRole('button', {
            name: 'Login',
        });

        await user.type(emailLoginInput, 'iam@teapot.com');
        await user.type(passwordLoginInput, 'password');
        await user.click(submitLoginButton);
        await waitFor(() => {
            expect(result.getByText('Welcome back! 😊')).toBeInTheDocument();
        });
    });
});

describe('AuthenticationModal', () => {
    it('should open the user auth modal on click of avatar on the header', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const emailInput = result.getByPlaceholderText(/name@example.com/i);
        const passwordInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');

        await user.type(emailInput, 'iam@teapot.com');

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(confirmPasswordInput).toBeInTheDocument();
        expect(emailInput).toHaveValue('iam@teapot.com');
    });

    it('should notify on invalid email input', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const emailInput = result.getByPlaceholderText(/name@example.com/i);

        await user.type(emailInput, 'erroneousEmail');

        expect(result.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    it('should notify on mismatched passwords', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const passwordInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');

        await user.type(passwordInput, 'password');
        await user.type(confirmPasswordInput, 'mismatchingpassword');

        expect(result.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should notify on mismatched passwords', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const passwordInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');

        await user.type(passwordInput, 'password');
        await user.type(confirmPasswordInput, 'mismatchingpassword');

        expect(result.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should notify that all fields are required onSubmit', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const submitButton = result.getByRole('button', {
            name: 'Sign up with email',
        });

        await user.click(submitButton);

        expect(result.getByText('Email is required')).toBeInTheDocument();
        expect(result.getByText('Password is required')).toBeInTheDocument();
        expect(
            result.getByText('Confirm password is required'),
        ).toBeInTheDocument();
    });

    it('should fail on attempt to register with an already registered email', async () => {
        server.use(
            rest.post('/api/auth/local/register', async (_req, res, ctx) => {
                return res(
                    ctx.status(
                        HttpStatusCode.Conflict,
                        'Email is already taken',
                    ),
                );
            }),
        );
        const user = userEvent.setup();
        const result = renderWithClient(<AuthenticationModal />);
        const userAuthButton = result.getByTestId('open-user-auth-dialog');

        await user.click(userAuthButton);

        const emailInput = result.getByPlaceholderText(/name@example.com/i);
        const passwordInput = result.getByPlaceholderText('Password');
        const confirmPasswordInput =
            result.getByPlaceholderText('Confirm password');
        const submitButton = result.getByRole('button', {
            name: 'Sign up with email',
        });

        await user.type(emailInput, 'iam@teapot.com');
        await user.type(passwordInput, 'password');
        await user.type(confirmPasswordInput, 'password');
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                result.getByText('Email is already taken'),
            ).toBeInTheDocument();
        });
    });
});
