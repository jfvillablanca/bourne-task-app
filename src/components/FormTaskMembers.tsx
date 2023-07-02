import { clsx } from 'clsx';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { FormChangeType, ProjectMember } from '../common';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui';

type OptionType = { label: string; value: string; _id: string };

interface FormTaskMembersProps {
    projectMembers: ProjectMember[];
    value: string[];
    handleChange: (e: FormChangeType) => void;
}

const FormTaskMembers = ({
    projectMembers,
    value,
    handleChange,
}: FormTaskMembersProps) => {
    const [open, setOpen] = useState(false);
    const allProjectMembers: OptionType[] = projectMembers.map((member) => {
        return { label: member.email, value: member.email, _id: member._id };
    });

    const selectedTaskMembers: OptionType[] = projectMembers
        .filter((member) => value.includes(member._id))
        .map((member) => {
            return {
                label: member.email,
                value: member.email,
                _id: member._id,
            };
        });

    const handleMenuChange = (
        selectedOptions: MultiValue<OptionType>,
        actionMeta: ActionMeta<OptionType>,
    ) => {
        if (
            actionMeta.action === 'select-option' ||
            actionMeta.action === 'remove-value' ||
            actionMeta.action === 'clear'
        ) {
            handleChange({
                name: 'assignedProjMemberId',
                value: selectedOptions.map((option) => option._id),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="btn btn-ghost rounded-full text-neutral-content hover:text-accent transition-colors"
                    data-testid={'open-select-update-assigned'}
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen((v) => !v);
                    }}
                >
                    <PlusCircle />
                </button>
            </DialogTrigger>
            <DialogContent className="relative z-10 bg-base-100 h-max transition">
                <Select
                    className="max-w-[40rem] z-10 min-w-[30rem] min-h-[2rem]"
                    data-testid={'select-update-assigned'}
                    autoFocus
                    defaultValue={selectedTaskMembers}
                    placeholder={'Select members to assign'}
                    options={allProjectMembers}
                    isMulti
                    unstyled
                    onChange={handleMenuChange}
                    closeMenuOnSelect={false}
                    aria-label="select to assign project members to this task"
                />
                <DialogClose className="absolute -bottom-7 right-0 pt-2 z-0 rounded-b-lg border border-neutral-content flex w-20 min-w-[4rem] justify-center text-neutral-content hover:bg-success hover:text-success-content">
                    <Check className="mr-1" />
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default FormTaskMembers;
