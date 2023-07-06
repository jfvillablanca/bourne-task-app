import { CircleDotIcon } from 'lucide-react';
import { HTMLAttributes, useEffect } from 'react';

import { cn } from '../lib/utils';

type Inputs = {
    email: string;
    password: string;
    confirmPassword: string;
};

import { SubmitHandler, useForm } from 'react-hook-form';
import { useToggle } from 'usehooks-ts';

import { Auth } from '../api';
import { AuthDto } from '../common';

import { Dialog, DialogContent, DialogTrigger } from './ui';

const AuthenticationModal: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const [open, toggleOpen, setOpen] = useToggle();
    const [isLogin /* toggleIsLogin */, , setIsLogin] = useToggle();

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
                    'flex flex-col justify-center items-center h-[50vh] border p-10 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                overlayClassName="bg-base-100/80"
                {...props}
            >
                <div className="tabs">
                    <a
                        className={`tab tab-bordered ${
                            isLogin ? '' : 'tab-active'
                        }`}
                        onClick={() => setIsLogin(false)}
                        aria-label="register tab"
                    >
                        Register
                    </a>
                    <a
                        className={`tab tab-bordered ${
                            isLogin ? 'tab-active' : ''
                        }`}
                        onClick={() => setIsLogin(true)}
                        aria-label="login tab"
                    >
                        Login
                    </a>
                </div>
                {isLogin ? (
                    <LoginForm setOpen={setOpen} />
                ) : (
                    <RegisterForm setOpen={setOpen} />
                )}
            </DialogContent>
        </Dialog>
    );
};

interface AuthFormProps extends HTMLAttributes<HTMLDivElement> {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegisterForm = ({ className, setOpen }: AuthFormProps) => {
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
    };

    useEffect(() => {
        if (registerMutation.isSuccess) {
            reset();
            setOpen(false);
        }
    }, [reset, registerMutation.isSuccess, setOpen]);

    return (
        <form
            className={cn(
                'form-control justify-center gap-2 h-full',
                className,
            )}
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
                        className={`input input-primary focus:input-accent placeholder:text-sm ${
                            registerMutation.error ? 'input-error' : ''
                        }`}
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: 'Invalid email address',
                            },
                            onChange: () => registerMutation.reset(),
                        })}
                    />
                    {errors.email && (
                        <span className="text-error">
                            {errors.email.message}
                        </span>
                    )}
                    {registerMutation.error && (
                        <span className="text-error">
                            {registerMutation.error.statusText}
                        </span>
                    )}
                </div>
                <div className="grid gap-1">
                    <input
                        className="input input-primary focus:input-accent placeholder:text-sm"
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
                        className="input input-primary focus:input-accent placeholder:text-sm"
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
    );
};

const LoginForm = ({ className, setOpen }: AuthFormProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AuthDto>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const loginMutation = Auth.useLoginLocal();

    const onSubmit: SubmitHandler<AuthDto> = async (formData) => {
        const authDto: AuthDto = {
            email: formData.email,
            password: formData.password,
        };
        loginMutation.mutate(authDto);
    };

    useEffect(() => {
        if (loginMutation.isSuccess) {
            reset();
            setOpen(false);
        }
    }, [reset, loginMutation.isSuccess, setOpen]);

    return (
        <form
            className={cn(
                'form-control justify-center gap-2 h-full',
                className,
            )}
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="flex flex-col space-y-2 mb-3 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Log in
                </h1>
                <p className="text-sm text-base-content/60">
                    Welcome back! Enter your credentials to login
                </p>
            </div>
            <div className="grid gap-3">
                <div className="grid gap-1">
                    <label className="sr-only" htmlFor="email">
                        Email
                    </label>
                    <input
                        className={`input input-primary focus:input-accent placeholder:text-sm ${
                            loginMutation.error?.type === 'user'
                                ? 'input-error'
                                : ''
                        }`}
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: 'Invalid email address',
                            },
                            onChange: () => loginMutation.reset(),
                        })}
                    />
                    {errors.email && (
                        <span className="text-error">
                            {errors.email.message}
                        </span>
                    )}
                    {loginMutation.error?.type === 'user' && (
                        <span className="text-error">
                            {loginMutation.error.statusText}
                        </span>
                    )}
                </div>
                <div className="grid gap-1">
                    <input
                        className={`input input-primary focus:input-accent placeholder:text-sm ${
                            loginMutation.error?.type === 'password'
                                ? 'input-error'
                                : ''
                        }`}
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
                    {loginMutation.error?.type === 'password' && (
                        <span className="text-error">
                            {loginMutation.error.statusText}
                        </span>
                    )}
                </div>
                <button
                    className="btn btn-outline text-lg normal-case"
                    type="submit"
                    disabled={loginMutation.isLoading}
                >
                    {loginMutation.isLoading ? (
                        <div className="loading loading-infinity loading-lg"></div>
                    ) : (
                        'Login'
                    )}
                </button>
            </div>
        </form>
    );
};

export default AuthenticationModal;
