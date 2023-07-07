import { HttpStatusCode } from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { toast } from 'react-toastify';
import { describe, it, vi } from 'vitest';

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

async function setup(jsx: JSX.Element) {
    // setup user event
    const event = userEvent.setup();

    // default user credentials
    const userCredentials = { email: 'iam@teapot.com', password: 'password' };

    // render result
    const result = renderWithClient(jsx);

    // open modal
    const userAuthButton = result.getByTestId('open-user-auth-dialog');
    await event.click(userAuthButton);

    // getBy tabs
    const loginTab = result.getByLabelText('login tab');
    const registerTab = result.getByLabelText('register tab');

    // getBy register form elements
    const emailRegisterInput = result.getByLabelText('register email input');
    const passwordRegisterInput = result.getByLabelText(
        'register password input',
    );
    const confirmPasswordRegisterInput = result.getByLabelText(
        'register confirm password input',
    );
    const submitRegisterButton = result.getByRole('button', {
        name: 'Sign up with email',
    });

    // user events for register form
    const typeEmailRegister = async (value: string) =>
        await event.type(emailRegisterInput, value);

    const typePasswordRegister = async (value: string) => {
        await event.type(passwordRegisterInput, value);
    };
    const typeConfirmPasswordRegister = async (value: string) => {
        await event.type(confirmPasswordRegisterInput, value);
    };
    const clickSubmitRegister = async () => {
        await event.click(submitRegisterButton);
    };

    // getBy login form elements
    const emailLoginInput = result.getByLabelText('login email input');
    const passwordLoginInput = result.getByLabelText('login password input');
    const submitLoginButton = result.getByRole('button', {
        name: 'Login',
    });

    // user events for login form
    const typeEmailLogin = async (value: string) =>
        await event.type(emailLoginInput, value);
    const typePasswordLogin = async (value: string) =>
        await event.type(passwordLoginInput, value);
    const clickSubmitLogin = async () => await event.click(submitLoginButton);

    const registerSuccessfully = async () => {
        await event.click(registerTab);
        await typeEmailRegister(userCredentials.email);
        await typePasswordRegister(userCredentials.password);
        await typeConfirmPasswordRegister(userCredentials.password);
        await clickSubmitRegister();
    };

    const loginSuccessfully = async () => {
        await event.click(loginTab);
        await typeEmailLogin(userCredentials.email);
        await typePasswordLogin(userCredentials.password);
        await clickSubmitLogin();
    };

    return {
        ...result,
        event,
        userAuthButton,
        userCredentials,
        loginTab,
        registerTab,

        emailRegisterInput,
        passwordRegisterInput,
        confirmPasswordRegisterInput,
        submitRegisterButton,
        typeEmailRegister,
        typePasswordRegister,
        typeConfirmPasswordRegister,
        clickSubmitRegister,
        registerSuccessfully,

        emailLoginInput,
        passwordLoginInput,
        submitLoginButton,
        typeEmailLogin,
        typePasswordLogin,
        clickSubmitLogin,
        loginSuccessfully,
    };
}

describe('AppWide', () => {
    it('should render toast on successful registration', async () => {
        const toastSuccessSpy = vi
            .spyOn(toast, 'success')
            .mockImplementation(() => "You're all set! 🥳");

        const { registerSuccessfully } = await setup(<App />);
        await registerSuccessfully();

        expect(toastSuccessSpy).toHaveBeenCalled();
        expect(toastSuccessSpy).toHaveReturnedWith("You're all set! 🥳");
        toastSuccessSpy.mockRestore();
    });

    it('should render toast on successful login', async () => {
        const toastSuccessSpy = vi
            .spyOn(toast, 'success')
            .mockImplementation(() => 'Welcome back! 😊');

        const { registerSuccessfully, loginSuccessfully } = await setup(
            <App />,
        );
        await registerSuccessfully();
        await loginSuccessfully();

        expect(toastSuccessSpy).toHaveBeenCalled();
        expect(toastSuccessSpy).toHaveReturnedWith('Welcome back! 😊');
        toastSuccessSpy.mockRestore();
    });
});

describe('AuthenticationModal', () => {
    it('should notify on invalid email input', async () => {
        const { typeEmailRegister, ...result } = await setup(
            <AuthenticationModal />,
        );

        await typeEmailRegister('erroneousEmail');

        expect(result.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    it('should notify on mismatched passwords', async () => {
        const { typePasswordRegister, typeConfirmPasswordRegister, ...result } =
            await setup(<AuthenticationModal />);

        await typePasswordRegister('password');
        await typeConfirmPasswordRegister('mismatchingpassword');

        expect(result.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should notify that all fields are required onSubmit', async () => {
        const { clickSubmitRegister, ...result } = await setup(
            <AuthenticationModal />,
        );

        await clickSubmitRegister();

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
        const {
            typeEmailRegister,
            typePasswordRegister,
            typeConfirmPasswordRegister,
            clickSubmitRegister,
            userCredentials,
            ...result
        } = await setup(<AuthenticationModal />);

        await typeEmailRegister(userCredentials.email);
        await typePasswordRegister(userCredentials.password);
        await typeConfirmPasswordRegister(userCredentials.password);
        await clickSubmitRegister();

        await waitFor(() => {
            expect(
                result.getByText('Email is already taken'),
            ).toBeInTheDocument();
        });
    });
});
