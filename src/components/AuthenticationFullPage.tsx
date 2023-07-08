import { GanttChart } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

import { ParticleBackground } from './ui';
import { AuthForm } from '.';

const AuthenticationFullPage: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const bgImageUrl = 'https://source.unsplash.com/cckf4TsHAuw';

    return (
        <div
            className={cn(
                'h-screen w-screen grid place-items-center',
                className,
            )}
            {...props}
        >
            <ParticleBackground />
            <div className="grid grid-cols-2 z-10 h-[50vh] border bg-base-100">
                <div className="relative col-span-1">
                    <div
                        className={`absolute w-full h-full -z-10 opacity-20 grayscale bg-[url(${bgImageUrl})] bg-cover bg-center bg-no-repeat`}
                    ></div>
                    <div className="flex mt-12 ml-5">
                        <GanttChart
                            className="h-20 w-max mr-2"
                            strokeLinecap="square"
                        />
                        <h1 className="flex-1 text-6xl max-w-min font-extrabold tracking-tight">
                            Bourne Task App
                        </h1>
                    </div>
                </div>
                <AuthForm className="h-full col-span-1 px-10 pt-5 pb-14" />
            </div>
        </div>
    );
};

export default AuthenticationFullPage;
