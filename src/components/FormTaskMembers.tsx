import { clsx } from 'clsx';
import { PlusCircle } from 'lucide-react';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { FormChangeType, ProjectMember } from '../common';

const FormTaskMembers = ({
    projectMembers,
    value,
    handleChange,
}: {
    projectMembers: ProjectMember[];
    value: string[];
    handleChange: (e: FormChangeType) => void;
}) => {
    const allProjectMembers = projectMembers.map((member) => {
        return { label: member.email, value: member.email, _id: member._id };
    });

    const selectedTaskMembers = projectMembers
        .filter((member) => value.includes(member._id))
        .map((member) => {
            return {
                label: member.email,
                value: member.email,
                _id: member._id,
            };
        });

    const handleMenuChange = (
        selectedOptions: MultiValue<{
            label: string;
            value: string;
            _id: string;
        }>,
        actionMeta: ActionMeta<{ label: string; value: string; _id: string }>,
    ) => {
        const selectedValues: string[] = Array.isArray(selectedOptions)
            ? selectedOptions.map((option) => option._id)
            : [];
        if (
            actionMeta.action === 'select-option' ||
            actionMeta.action === 'remove-value'
        ) {
            handleChange({
                name: 'assignedProjMemberId',
                value: selectedValues,
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
                name="assignedProjMemberId"
                onChange={handleMenuChange}
                aria-label="select to assign project members to this task"
            />
        </div>
    );
};

export default FormTaskMembers;
