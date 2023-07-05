import { CircleDotIcon } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { cn } from '../lib/utils';

type Inputs = {
    email: string;
    password: string;
    confirmPassword: string;
};

import { SubmitHandler, useForm } from 'react-hook-form';

import { Auth } from '../api';
import { AuthDto } from '../common';

import { Dialog, DialogContent, DialogTrigger } from './ui';

const AuthenticationModal: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm<Inputs>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const registerMutation = Auth.useRegisterLocal();

    const onSubmit: SubmitHandler<Inputs> = async (formData) => {
        const authDto: AuthDto = {
            email: formData.email,
            password: formData.password,
        };
        registerMutation.mutate(authDto);
        reset();
        setOpen(false);
    };

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
                    'justify-center items-center h-[50vh] border p-10 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                overlayClassName="bg-base-100/80"
                {...props}
            >
                <form
                    className="form-control justify-center gap-2 h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col space-y-2 mb-3 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-base-content/60">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <div className="grid gap-3">
                        <div className="grid gap-1">
                            <label className="sr-only" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="input input-bordered focus:input-accent placeholder:text-sm"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />
                            {errors.email && (
                                <span className="text-error">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <input
                                className="input input-bordered focus:input-accent placeholder:text-sm"
                                type="password"
                                placeholder="Password"
                                {...register('password', {
                                    required: 'Password is required',
                                })}
                            />
                            {errors.password && (
                                <span className="text-error">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <input
                                className="input input-bordered focus:input-accent placeholder:text-sm"
                                type="password"
                                placeholder="Confirm password"
                                {...register('confirmPassword', {
                                    required: 'Confirm password is required',
                                    validate: (value) => {
                                        return (
                                            value === getValues('password') ||
                                            'Passwords do not match'
                                        );
                                    },
                                })}
                            />
                            {errors.confirmPassword && (
                                <span className="text-error">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                        <button
                            className="btn btn-outline text-lg normal-case"
                            type="submit"
                            disabled={registerMutation.isLoading}
                        >
                            {registerMutation.isLoading ? (
                                <div className="loading loading-infinity loading-lg"></div>
                            ) : (
                                'Sign up with email'
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AuthenticationModal;
