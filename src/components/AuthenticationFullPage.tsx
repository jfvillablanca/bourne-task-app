import { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

import { AuthForm } from '.';

const AuthenticationFullPage: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'h-screen w-screen grid place-items-center',
                className,
            )}
            {...props}
        >
            <div className="h-[50vh] border p-10">
                <AuthForm />
            </div>
        </div>
    );
};

export default AuthenticationFullPage;
