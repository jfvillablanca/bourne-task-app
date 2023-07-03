import { CircleDotIcon } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { cn } from '../lib/utils';

import { Dialog, DialogContent, DialogTrigger } from './ui';

const AuthenticationModal: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="ml-auto mr-2"
                    data-testid="open-user-auth-dialog"
                    onClick={() => setOpen((v) => !v)}
                >
                    <div className="avatar flex items-center">
                        {/* TODO: This is a placeholder */}
                        <CircleDotIcon className="btn bg-transparent hover:bg-transparent border-none h-9 w-max" />
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    'justify-center items-center h-[50vh] border rounded-lg p-10 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                overlayClassName="bg-base-100/80"
                {...props}
            >
                <form
                    className="form-control justify-center gap-2 h-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-base-content/60">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid gap-1">
                            <label className="sr-only" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="input input-bordered placeholder:text-sm"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="grid gap-1">
                            <input
                                className="input input-bordered placeholder:text-sm"
                                type="password"
                                placeholder="Password"
                            />
                        </div>
                        <div className="grid gap-1">
                            <input
                                className="input input-bordered placeholder:text-sm"
                                type="password"
                                placeholder="Confirm password"
                            />
                        </div>
                        <button
                            className="btn text-lg normal-case"
                            type="submit"
                        >
                            Sign up with email
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AuthenticationModal;
