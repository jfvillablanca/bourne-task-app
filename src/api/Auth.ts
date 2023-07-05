import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthDto, AuthToken } from '../common';

import { post } from '.';

export const Auth = {
    queryKeys: {
        all: ['users'] as const,
    },

    useRegisterLocal: () => {
        const queryClient = useQueryClient();
        return useMutation<AuthToken, AxiosError, AuthDto>({
            mutationFn: (credentials: AuthDto) => registerLocal(credentials),
            onSuccess: () => {
                toast.success("You're all set! 🥳");
                return queryClient.invalidateQueries({
                    queryKey: Auth.queryKeys.all,
                });
            },
        });
    },
};

const registerLocal = async (credentials: AuthDto): Promise<AuthToken> => {
    const response = await post(`/api/auth/local/register`, credentials);
    return response.data;
};
