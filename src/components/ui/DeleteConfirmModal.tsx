import { HTMLAttributes } from 'react';
import { useToggle } from 'usehooks-ts';

import { cn } from '../../lib/utils';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    ExitButton,
} from '.';

interface DeleteConfirmModalProps extends HTMLAttributes<HTMLDivElement> {
    renderButton: () => JSX.Element;
    renderWarningModal: () => JSX.Element;
}

export const DeleteConfirmModal = ({
    className,
    renderButton,
    renderWarningModal,
    ...props
}: DeleteConfirmModalProps) => {
    const [open, toggleOpen, setOpen] = useToggle();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={toggleOpen}>
                {renderButton()}
            </DialogTrigger>
            <DialogContent
                className={cn(
                    'relative border p-10 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                overlayClassName="bg-base-100/80"
                {...props}
            >
                <DialogClose className="absolute top-2 right-1">
                    <ExitButton />
                </DialogClose>
                {renderWarningModal()}
            </DialogContent>
        </Dialog>
    );
};
