import { HTMLAttributes, useCallback } from 'react';
import { Particles } from 'react-tsparticles';
import { Engine, ISourceOptions } from 'tsparticles-engine';
import { loadTrianglesPreset } from 'tsparticles-preset-triangles';

import { cn } from '../../lib/utils';

export const ParticleBackground: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const init = useCallback(async (engine: Engine) => {
        await loadTrianglesPreset(engine);
    }, []);

    const options: ISourceOptions = {
        preset: 'triangles',
        particles: {
            move: {
                speed: 1,
            },
        },
    };

    return (
        <Particles
            className={cn(
                'absolute h-full w-full blur-sm opacity-75',
                className,
            )}
            options={options}
            init={init}
            {...props}
        />
    );
};
