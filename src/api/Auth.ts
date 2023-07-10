import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthDto, AuthToken } from '../common';
import { tokenStorage } from '../lib/utils';

import { post } from '.';

export const Auth = {
    queryKeys: {
        all: ['users'] as const,
    },

    useRegisterLocal: () => {
        const queryClient = useQueryClient();
        return useMutation<AuthToken, AxiosError['response'], AuthDto>({
            mutationFn: (credentials: AuthDto) => registerLocal(credentials),
            onSuccess: (data) => {
                tokenStorage.setToken(data);
                toast.success("You're all set! 🥳");
                return queryClient.invalidateQueries({
                    queryKey: Auth.queryKeys.all,
                });
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLoginLocal: () => {
        const queryClient = useQueryClient();
        return useMutation<
            AuthToken,
            AxiosError['response'] & { type: 'password' | 'user' },
            AuthDto
        >({
            mutationFn: (credentials: AuthDto) => loginLocal(credentials),
            onError: (error) => {
                if (error?.statusText === 'Invalid password') {
                    error.type = 'password';
                    return error;
                }
                error.type = 'user';
                return error;
            },
            onSuccess: (data) => {
                tokenStorage.setToken(data);
                toast.success('Welcome back! 😊');
                return queryClient.invalidateQueries({
                    queryKey: Auth.queryKeys.all,
                });
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },
};

const registerLocal = async (credentials: AuthDto): Promise<AuthToken> => {
    const response = await post(`/api/auth/local/register`, credentials);
    return response.data;
};

const loginLocal = async (credentials: AuthDto): Promise<AuthToken> => {
    const response = await post(`/api/auth/local/login`, credentials);
    return response.data;
};
