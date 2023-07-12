import { HTMLAttributes, useEffect } from 'react';

import { Auth } from '../api';

import AuthenticationFullPage from './AuthenticationFullPage';

const AuthLoader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children }) => {
    const { isError, isLoading, data, refetch } = Auth.useUser();

    useEffect(() => {
        if (!isError) {
            refetch();
        }
    }, [isError, refetch]);

    if (isError || !data || isLoading) {
        return (
            <div className="relative">
                {isLoading && (
                    <div className="absolute z-10 h-screen w-screen backdrop-blur-[4px]" />
                )}
                <div className="relative z-0">
                    <AuthenticationFullPage />;
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthLoader;
