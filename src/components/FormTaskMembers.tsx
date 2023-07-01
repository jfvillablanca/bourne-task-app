import { clsx } from 'clsx';
import { PlusCircle } from 'lucide-react';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { FormChangeType, ProjectMember } from '../common';

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
            actionMeta.action === 'remove-value'
        ) {
            handleChange({
                name: 'assignedProjMemberId',
                value: selectedOptions.map((option) => option._id),
            });
        }
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-ghost rounded-full text-neutral-content hover:text-accent transition-colors"
                data-testid={'open-select-update-assigned'}
                onClick={(e) => e.preventDefault()}
            >
                <PlusCircle className="" />
            </button>

            <Select
                className="select h-20 min-w-[10rem] dropdown-content z-[1] p-2"
                data-testid={'select-update-assigned'}
                classNames={{
                    control: ({ isFocused }) =>
                        clsx(
                            'border w-max rounded-lg',
                            isFocused ? 'border-accent' : 'border-base-content',
                        ),
                }}
                defaultValue={selectedTaskMembers}
                options={allProjectMembers}
                isMulti
                // unstyled
                onChange={handleMenuChange}
                aria-label="select to assign project members to this task"
            />
        </div>
    );
};

export default FormTaskMembers;
