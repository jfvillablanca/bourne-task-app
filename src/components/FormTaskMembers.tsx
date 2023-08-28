import { Check, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { FormChangeType, User } from '../common';
import { cn } from '../lib/utils';

import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui';

type OptionType = { label: string; value: string; _id: string };

interface FormTaskMembersProps {
    allUsers: User[];
    selectedUsers: string[];
    handleChange: (e: FormChangeType) => void;
}

const FormTaskMembers = ({
    allUsers,
    selectedUsers,
    handleChange,
}: FormTaskMembersProps) => {
    const [open, setOpen] = useState(false);
    const allUserOptions: OptionType[] = allUsers.map((user) => {
        return { label: user.email, value: user.email, _id: user._id };
    });

    const selectedUserOptions: OptionType[] = allUsers
        .filter((user) => selectedUsers.includes(user._id))
        .map((user) => {
            return {
                label: user.email,
                value: user.email,
                _id: user._id,
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
                    className="p-3 rounded-full border border-dashed border-neutral-content/50 text-neutral-content/50 hover:text-accent-content hover:border-accent-content transition-colors"
                    data-testid={'open-select-update-assigned'}
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen((v) => !v);
                    }}
                >
                    <PlusCircle />
                </button>
            </DialogTrigger>
            <DialogContent
                className="relative z-10 h-max transition"
                overlayClassName="backdrop-blur-[2px]"
            >
                <Select
                    className="max-w-[50rem] w-fit z-10 min-w-[30rem] min-h-[2rem]"
                    data-testid={'select-update-assigned'}
                    autoFocus
                    classNames={{
                        control: () =>
                            cn('bg-base-100 text-neutral-content h-full'),
                        valueContainer: () =>
                            cn(
                                'border border-neutral-content border-r-0 py-3 px-2',
                            ),
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
                        indicatorsContainer: () =>
                            cn(
                                'border border-neutral-content flex w-20 min-w-[4rem]',
                            ),
                        clearIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center',
                                isFocused
                                    ? 'text-warning hover:bg-warning hover:text-warning-content'
                                    : '',
                            ),
                        dropdownIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center',
                                isFocused
                                    ? 'text-info hover:bg-info hover:text-info-content'
                                    : '',
                            ),
                        menu: () => cn('bg-base-300/90 text-base-content my-1'),
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
                    defaultValue={selectedUserOptions}
                    placeholder={'Select members to assign'}
                    options={allUserOptions}
                    isMulti
                    unstyled
                    onChange={handleMenuChange}
                    closeMenuOnSelect={false}
                    aria-label="select to assign project members to this task"
                />
                <DialogClose className="absolute -bottom-9 right-0 w-20 min-w-[4rem] pt-2 pb-1 z-0 flex justify-center border border-neutral-content bg-base-100 text-neutral-content hover:bg-success hover:text-success-content">
                    <Check className="mr-1" />
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default FormTaskMembers;
