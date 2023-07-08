import { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

import { ParticleBackground } from './ui';
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
            <ParticleBackground />
            <div className="z-10 h-[50vh] border p-10 bg-base-100">
                <AuthForm />
            </div>
        </div>
    );
};

export default AuthenticationFullPage;
