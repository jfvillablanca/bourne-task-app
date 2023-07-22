import { HTMLAttributes } from 'react';

import { Auth } from '../api';

import AuthenticationFullPage from './AuthenticationFullPage';

const AuthLoader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children }) => {
    const { isError, isInitialLoading } = Auth.useUser();

    if (isError || isInitialLoading) {
        return (
            <div className="relative">
                {isInitialLoading && (
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
