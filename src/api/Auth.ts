import { AxiosError } from 'axios';
import { configureAuth } from 'react-query-auth';
import { toast } from 'react-toastify';

import { AuthDto, AuthToken, User } from '../common';
import { decodeAccessToken, tokenStorage } from '../lib/utils';

import { get, post } from '.';

type AuthError = AxiosError['response'] & { type?: 'password' | 'user' };

const { useUser, useRegister, useLogin, useLogout } = configureAuth<
    User,
    AuthError,
    AuthDto,
    AuthDto
>({
    userFn: () => getUser(),
    registerFn: (credentials: AuthDto) => registerLocal(credentials),
    loginFn: (credentials: AuthDto) => loginLocal(credentials),
    logoutFn: () => logout(),
});

export const Auth = {
    useUser,

    useRegisterLocal: () => {
        return useRegister({
            onSuccess: () => {
                toast.success("You're all set! 🥳");
            },
            onError: (error) => {
                return error;
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLoginLocal: () => {
        return useLogin({
            onError: (error) => {
                if (error?.statusText === 'Invalid password') {
                    error.type = 'password';
                    return error;
                }
                error.type = 'user';
                return error;
            },
            onSuccess: () => {
                toast.success('Welcome back! 😊');
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLogout,
};

async function getUser(): Promise<User> {
    const response = await get('/api/users/me');
    return response.data;
}

async function logout() {
    tokenStorage.clearTokens();
    await post('/api/auth/logout');
}

async function registerLocal(credentials: AuthDto) {
    const response = await post(`/api/auth/local/register`, credentials);
    return handleUserResponse(response.data);
}

async function loginLocal(credentials: AuthDto) {
    const response = await post(`/api/auth/local/login`, credentials);
    return handleUserResponse(response.data);
}

function handleUserResponse(data: AuthToken) {
    tokenStorage.setTokens(data);
    const decodedData = decodeAccessToken(data.access_token);
    const user: User = {
        _id: decodedData.sub,
        email: decodedData.email,
    };
    return user;
}
