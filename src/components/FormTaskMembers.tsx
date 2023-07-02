import { Check, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { FormChangeType, ProjectMember } from '../common';
import { cn } from '../lib/utils';

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
                    className="max-w-[50rem] w-fit z-10 min-w-[30rem] min-h-[2rem]"
                    data-testid={'select-update-assigned'}
                    autoFocus
                    classNames={{
                        control: ({ isFocused }) =>
                            cn(
                                'bg-neutral text-neutral-content h-full rounded border rounded-lg rounded-br-none',
                                isFocused
                                    ? 'border-accent'
                                    : 'border-neutral-content',
                            ),
                        valueContainer: () => cn('py-3 px-2'),
                        input: () => cn('m-0.5 py-0.5 text-md font-semibold'),
                        multiValue: () =>
                            cn(
                                'm-1 bg-base-300 rounded-md text-md text-base-content font-semibold',
                            ),
                        multiValueLabel: () => cn('py-1 px-2'),
                        multiValueRemove: () =>
                            cn(
                                'rounded-r-md px-1 hover:bg-error hover:text-error-content',
                            ),
                        indicatorsContainer: () => cn('flex w-20 min-w-[4rem]'),
                        clearIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center',
                                isFocused
                                    ? 'text-warning hover:bg-warning hover:text-warning-content'
                                    : '',
                            ),
                        indicatorSeparator: () => cn('bg-neutral-content'),
                        dropdownIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center rounded-r-lg',
                                isFocused
                                    ? 'text-info hover:bg-info hover:text-info-content'
                                    : '',
                            ),
                        menu: () =>
                            cn(
                                'bg-base-300/90 text-base-content rounded-xl my-1',
                            ),
                        menuList: () => cn('py-2'),
                        noOptionsMessage: () =>
                            cn('py-2 px-3 font-semibold uppercase'),
                        option: ({ isFocused }) =>
                            cn(
                                isFocused
                                    ? 'bg-primary text-primary-content font-semibold'
                                    : 'bg-transparent',
                                'py-2 px-3',
                            ),
                        placeholder: () => cn('mx-0.5'),
                    }}
                    defaultValue={selectedTaskMembers}
                    placeholder={'Select members to assign'}
                    options={allProjectMembers}
                    isMulti
                    unstyled
                    onChange={handleMenuChange}
                    closeMenuOnSelect={false}
                    aria-label="select to assign project members to this task"
                />
                <DialogClose className="absolute -bottom-7 right-0 w-20 min-w-[4rem] pt-2 z-0 flex justify-center rounded-b-lg bg-neutral text-neutral-content hover:bg-success hover:text-success-content">
                    <Check className="mr-1" />
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default FormTaskMembers;
