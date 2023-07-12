import { HTMLAttributes, useEffect } from 'react';

import { Auth } from '../api';

import AuthenticationFullPage from './AuthenticationFullPage';

// interface AuthLoaderProps extends HTMLAttributes<HTMLDivElement> {
//     // renderLoading: () => JSX.Element;
//     renderUnauthenticated: () => JSX.Element;
// }

const AuthLoader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children }) => {
    const { isError, isLoading, data, refetch } = Auth.useUser();

    useEffect(() => {
        if (!isError) {
            refetch();
        }
    }, [isError, refetch]);

    if (isLoading) {
        // TODO: return a blurred <AuthFullPage>
        return <div>Loading...</div>;
    }

    if (isError || !data) {
        return <AuthenticationFullPage />;
    }

    return <>{children}</>;
};

export default AuthLoader;
