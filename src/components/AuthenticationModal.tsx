import { CircleDotIcon } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useToggle } from 'usehooks-ts';

import { cn } from '../lib/utils';

import { Dialog, DialogContent, DialogTrigger } from './ui';
import { AuthForm } from '.';

const AuthenticationModal: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const [open, toggleOpen, setOpen] = useToggle();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="ml-auto mr-2"
                    data-testid="open-user-auth-dialog"
                    onClick={toggleOpen}
                >
                    <div className="avatar flex items-center">
                        {/* TODO: This is a placeholder */}
                        <CircleDotIcon className="btn bg-transparent hover:bg-transparent border-none h-9 w-max" />
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    'h-[50vh] border p-10 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                overlayClassName="bg-base-100/80"
                {...props}
            >
                <AuthForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
};

export default AuthenticationModal;
